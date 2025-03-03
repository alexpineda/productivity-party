"use server";
import type { ProductivityBlock } from "@/lib/types/productivity-types";
import {
  partitionIntoBlocks,
  chunkTextForLLM,
} from "@/lib/utilities/classification-utils";
import { updatePartyKitScore } from "./partykit-actions";
import { appendToLog } from "@/lib/utilities/log-utils";
import {
  getPipeSetting,
  updatePipeSettings,
} from "@/lib/utilities/settings-utils";
import {
  PRODUCTIVITY_SCORE_UPDATE_INTERVAL,
  SCREENPIPE_API_URL,
} from "@/config";

export async function getProductivityData(
  lookBackIntervals: number = 3
): Promise<ProductivityBlock[]> {
  const now = new Date();
  const timeRangeAgo = new Date(
    now.getTime() -
      PRODUCTIVITY_SCORE_UPDATE_INTERVAL * lookBackIntervals * 60 * 1000
  );

  appendToLog(
    `getProductivityData: using HTTP API, looking back ${lookBackIntervals} intervals`
  );

  try {
    // Get last processed blocks from settings using the utility
    const processedBlocks = await getPipeSetting("processedBlocks", []);

    // Query screenpipe's /search endpoint directly
    const searchParams = new URLSearchParams({
      content_type: "ocr",
      start_time: timeRangeAgo.toISOString(),
      end_time: now.toISOString(),
      limit: "1000",
    });

    const response = await fetch(
      `${SCREENPIPE_API_URL}/search?${searchParams}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.data) {
      return [];
    }

    const { data: contentItems } = data;

    // Partition into 5-minute blocks
    const partitionedBlocks = partitionIntoBlocks(contentItems, 5);

    // Convert each partitioned block into a ProductivityBlock
    const productivityBlocks: ProductivityBlock[] = partitionedBlocks.map(
      (block) => {
        // Create a normalized block ID based on PRODUCTIVITY_SCORE_UPDATE_INTERVAL
        // Round the timestamp to the nearest interval to ensure consistent IDs
        const blockDate = new Date(block.startTime);
        const minutes = blockDate.getMinutes();
        const normalizedMinutes =
          Math.floor(minutes / PRODUCTIVITY_SCORE_UPDATE_INTERVAL) *
          PRODUCTIVITY_SCORE_UPDATE_INTERVAL;

        // Create a normalized date with minutes aligned to intervals
        const normalizedDate = new Date(blockDate);
        normalizedDate.setMinutes(normalizedMinutes, 0, 0); // zero out seconds and milliseconds

        // Format: YYYY-MM-DDTHH:MM
        const normalizedTimeStr = normalizedDate.toISOString().slice(0, 16);
        const blockId = `block-${normalizedTimeStr}`;

        // Check if this block has already been processed
        const existingBlock = processedBlocks.find(
          (b: any) => b.id === blockId
        );

        // If this block has already been processed, return the existing block
        if (existingBlock) {
          return {
            ...existingBlock,
            processed: true,
          };
        }

        // Combine all text from OCR or UI
        let combinedText = "";
        block.items.forEach((item) => {
          if (item.type === "OCR") {
            combinedText += item.content.text + "\n\n";
          } else if (item.type === "UI") {
            combinedText += item.content.text + "\n\n";
          }
        });

        // Chunk text
        const chunkedArray = chunkTextForLLM(combinedText, {
          chunkSize: 300,
          anonymize: true,
        });
        const contentSummary = chunkedArray.join("\n---\n");

        return {
          id: blockId,
          startTime: block.startTime,
          endTime: block.endTime,
          contentSummary,
          // Default classification is 'break' for now
          classification: "break",
          // We assume 100% active ratio for demonstration
          activeRatio: 1,
          aiDescription: "",
          processed: false,
        } satisfies ProductivityBlock;
      }
    );

    return productivityBlocks;
  } catch (error) {
    appendToLog("getProductivityData: error retrieving screen usage");
    throw new Error(`Failed to fetch or process screen data: ${String(error)}`);
  }
}

/**
 * @function aggregateProductivityBlocks
 * @description
 * Calculates a score delta based on classified productivity blocks.
 * Productive blocks add +1, unproductive blocks subtract -1, breaks are neutral.
 * Partial blocks are weighted by their activeRatio.
 *
 * @param blocks Array of ProductivityBlock objects (with classification set)
 * @returns total numeric score delta
 *
 * @example
 * const delta = aggregateProductivityBlocks(blocks);
 * // if user had 3 "productive" blocks, 1 "unproductive", rest break => delta = +2
 */
export async function aggregateProductivityBlocks(
  blocks: ProductivityBlock[]
): Promise<number> {
  let scoreDelta = 0;

  for (const block of blocks) {
    const ratio = block.activeRatio ?? 1;

    switch (block.classification) {
      case "productive":
        scoreDelta += ratio;
        break;
      case "unproductive":
        scoreDelta -= ratio;
        break;
      case "break":
      default:
        // no-op
        break;
    }
  }

  // Round if partial
  return Math.round(scoreDelta);
}

/**
 * @function updateUserScore
 * @description
 * Server action that updates the user's productivity score by sending a delta to the PartyKit server.
 * Still maintains processed blocks in local settings for deduplication.
 */
export async function updateUserScore(
  scoreDelta: number,
  persist = true,
  processedBlocks: ProductivityBlock[] = []
): Promise<void> {
  if (persist) {
    // Store newly processed blocks for deduplication purposes
    if (processedBlocks.length > 0) {
      const oldProcessedBlocks = await getPipeSetting("processedBlocks", []);
      const newProcessedBlocks = processedBlocks
        .filter((block) => !!block.id)
        .map((block) => ({
          ...block,
          processed: true,
        }));

      // Merge them and de-duplicate by block.id
      const combined = [...oldProcessedBlocks, ...newProcessedBlocks];
      const dedupedMap = combined.reduce<
        Record<string, (typeof combined)[number]>
      >((acc, block) => {
        if (block.id) {
          acc[block.id] = block;
        }
        return acc;
      }, {});
      const dedupedBlocks = Object.values(dedupedMap);

      // Keep the most recent 50 blocks to avoid unlimited growth
      dedupedBlocks.sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      });
      const processedBlocksToStore = dedupedBlocks.slice(0, 50);

      // Update only processed blocks in settings, not the score
      await updatePipeSettings({
        processedBlocks: processedBlocksToStore,
      });
    }

    // Send only the delta to PartyKit server
    try {
      await updatePartyKitScore(scoreDelta);
    } catch (error) {
      console.error("Failed to update PartyKit score:", error);
    }
  }
}
