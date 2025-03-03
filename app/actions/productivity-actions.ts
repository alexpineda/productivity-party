"use server";
import type {
  ProductivityBlock,
  RawContentItem,
  PartitionedBlock,
} from "@/lib/types/productivity-types";
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

/**
 * @function fetchRawScreenpipeData
 * @description Fetches raw data from Screenpipe API for a given time range
 * This function is responsible ONLY for data retrieval, not processing
 */
export async function fetchRawScreenpipeData(
  lookBackIntervals: number = 3
): Promise<RawContentItem[]> {
  const now = new Date();
  const timeRangeAgo = new Date(
    now.getTime() -
      PRODUCTIVITY_SCORE_UPDATE_INTERVAL * lookBackIntervals * 60 * 1000
  );

  appendToLog(
    `fetchRawScreenpipeData: looking back ${lookBackIntervals} intervals`
  );

  try {
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

    return data.data;
  } catch (error) {
    appendToLog("fetchRawScreenpipeData: error retrieving screen usage");
    throw new Error(`Failed to fetch screen data: ${String(error)}`);
  }
}

/**
 * @function convertToProductivityBlocks
 * @description
 * Converts raw content items into productivity blocks with normalized IDs
 * This function handles the logic of creating structured blocks from raw data
 */
export async function convertToProductivityBlocks(
  contentItems: RawContentItem[]
): Promise<ProductivityBlock[]> {
  try {
    // Partition raw content items into 5-minute blocks
    const partitionedBlocks = partitionIntoBlocks(contentItems, 5);

    // Convert each partitioned block into a ProductivityBlock
    const productivityBlocks: ProductivityBlock[] = partitionedBlocks.map(
      (block) => {
        // Create a normalized block ID based on PRODUCTIVITY_SCORE_UPDATE_INTERVAL
        const blockId = generateBlockId(block.startTime);

        // Combine all text from OCR or UI
        let combinedText = "";
        block.items.forEach((item) => {
          if (item.type === "OCR" || item.type === "UI") {
            combinedText += item.content.text + "\n\n";
          }
        });

        // Chunk text for LLM processing
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
          // Default classification is 'break' until processed
          classification: {
            classification: "break",
            shortSummary: "",
            reason: "",
          },
          // We assume 100% active ratio for demonstration
          activeRatio: 1,
          processed: false,
        } satisfies ProductivityBlock;
      }
    );

    return productivityBlocks;
  } catch (error) {
    appendToLog("convertToProductivityBlocks: error processing content items");
    throw new Error(`Failed to process content items: ${String(error)}`);
  }
}

/**
 * @function getProcessedBlocks
 * @description
 * Gets blocks that have already been processed from user settings
 * Used for display purposes - showing historical productivity data
 */
export async function getProcessedBlocks(): Promise<ProductivityBlock[]> {
  try {
    return await getPipeSetting("processedBlocks", []);
  } catch (error) {
    appendToLog("getProcessedBlocks: error retrieving processed blocks");
    throw new Error(`Failed to get processed blocks: ${String(error)}`);
  }
}

/**
 * @function getProductivityData
 * @description
 * Gets both processed and unprocessed blocks for a time range
 * Used primarily for display purposes in the UI
 */
export async function getProductivityData(
  lookBackIntervals: number = 3
): Promise<ProductivityBlock[]> {
  appendToLog(
    `getProductivityData: using HTTP API, looking back ${lookBackIntervals} intervals`
  );

  try {
    // 1. Get previously processed blocks
    const processedBlocks = await getProcessedBlocks();

    // 2. Fetch raw content items
    const contentItems = await fetchRawScreenpipeData(lookBackIntervals);

    // 3. Convert to structured productivity blocks
    const newBlocks = await convertToProductivityBlocks(contentItems);

    // 4. Merge with existing processed blocks (prioritizing processed ones)
    const mergedBlocks = mergeProductivityBlocks(processedBlocks, newBlocks);

    return mergedBlocks;
  } catch (error) {
    appendToLog("getProductivityData: error retrieving or processing data");
    throw new Error(`Failed to get productivity data: ${String(error)}`);
  }
}

/**
 * @function getUnprocessedBlocks
 * @description
 * Gets only blocks that haven't been processed yet
 * Used specifically for the classification and scoring pipeline
 */
export async function getUnprocessedBlocks(
  lookBackIntervals: number = 3
): Promise<ProductivityBlock[]> {
  try {
    // 1. Get all productivity blocks
    const allBlocks = await getProductivityData(lookBackIntervals);

    // 2. Filter out already processed blocks, and ensure all blocks have content
    return allBlocks.filter(
      (block) => !block.processed && block.contentSummary
    );
  } catch (error) {
    appendToLog("getUnprocessedBlocks: error filtering unprocessed blocks");
    throw new Error(`Failed to get unprocessed blocks: ${String(error)}`);
  }
}

/**
 * @function processBlocks
 * @description
 * Processes raw blocks by classifying them using an AI model
 * This is where the actual classification happens
 *
 * @param blocks - The blocks to classify
 * @param userRole - The user's role (used for classification context)
 * @returns The same blocks but with classifications set
 */
export async function processBlocks(
  blocks: ProductivityBlock[],
  userRole: string
): Promise<ProductivityBlock[]> {
  try {
    const processedBlocks = [...blocks];

    // Get the classification action
    const { classifyBlock } = await import("./classify-actions");

    // Process each unprocessed block
    for (const block of processedBlocks) {
      // Skip blocks with no content
      if (!block.contentSummary) {
        block.classification = {
          classification: "break",
          shortSummary: "",
          reason: "",
        };
        continue;
      }

      // Classify the block using the AI model
      const label = await classifyBlock(block.contentSummary, userRole);
      block.classification = label;
    }

    return processedBlocks;
  } catch (error) {
    appendToLog(`processBlocks: error classifying blocks - ${error}`);
    throw new Error(`Failed to process blocks: ${String(error)}`);
  }
}

/**
 * @function processAndScoreNewBlocks
 * @description
 * Main orchestration function that handles the entire pipeline:
 * 1. Gets unprocessed blocks
 * 2. Classifies them
 * 3. Calculates score delta
 * 4. Updates user score and marks blocks as processed
 *
 * This is the main function called by the calcscore API route
 *
 * @param userRole - The user's role for classification context
 * @param lookBackIntervals - How many intervals to look back
 * @returns Statistics about the processing
 */
export async function processAndScoreNewBlocks(
  userRole: string,
  lookBackIntervals: number = 3
): Promise<{
  success: boolean;
  scoreDelta: number;
  processedBlockCount: number;
  recentBlocks: ProductivityBlock[];
}> {
  try {
    // 1. Get unprocessed blocks
    const unprocessedBlocks = await getUnprocessedBlocks(lookBackIntervals);

    // Early return if no blocks to process
    if (unprocessedBlocks.length === 0) {
      appendToLog("No unprocessed blocks found");
      return {
        success: true,
        scoreDelta: 0,
        processedBlockCount: 0,
        recentBlocks: [],
      };
    }

    appendToLog(`Processing ${unprocessedBlocks.length} unprocessed blocks`);

    // 2. Process (classify) the blocks
    const processedBlocks = await processBlocks(unprocessedBlocks, userRole);

    // 3. Calculate score delta based on classifications
    const scoreDelta = await aggregateProductivityBlocks(processedBlocks);

    // 4. Update user score and mark blocks as processed
    await updateUserScore(scoreDelta, true, processedBlocks);

    // Log success
    appendToLog({
      scoreDelta,
      processedBlockCount: processedBlocks.length,
    });

    // Return statistics
    return {
      success: true,
      scoreDelta,
      processedBlockCount: processedBlocks.length,
      recentBlocks: processedBlocks.slice(-3),
    };
  } catch (error) {
    appendToLog(`processAndScoreNewBlocks error: ${error}`);
    throw new Error(`Failed to process and score blocks: ${String(error)}`);
  }
}

/**
 * Helper function to generate consistent block IDs
 */
function generateBlockId(timestamp: string): string {
  const blockDate = new Date(timestamp);
  const minutes = blockDate.getMinutes();
  const normalizedMinutes =
    Math.floor(minutes / PRODUCTIVITY_SCORE_UPDATE_INTERVAL) *
    PRODUCTIVITY_SCORE_UPDATE_INTERVAL;

  // Create a normalized date with minutes aligned to intervals
  const normalizedDate = new Date(blockDate);
  normalizedDate.setMinutes(normalizedMinutes, 0, 0); // zero out seconds and milliseconds

  // Format: YYYY-MM-DDTHH:MM
  const normalizedTimeStr = normalizedDate.toISOString().slice(0, 16);
  return `block-${normalizedTimeStr}`;
}

/**
 * Helper function to merge processed and new blocks with deduplication
 */
function mergeProductivityBlocks(
  processedBlocks: ProductivityBlock[],
  newBlocks: ProductivityBlock[]
): ProductivityBlock[] {
  // Create a map of all blocks by ID
  const blockMap = new Map<string, ProductivityBlock>();

  // Add processed blocks to the map first (they take priority)
  processedBlocks.forEach((block) => {
    if (block.id) {
      blockMap.set(block.id, { ...block, processed: true });
    }
  });

  // Add new blocks only if they don't exist in the map
  newBlocks.forEach((block) => {
    if (block.id && !blockMap.has(block.id)) {
      blockMap.set(block.id, block);
    }
  });

  // Convert map back to array and sort by time
  return Array.from(blockMap.values()).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
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

    switch (block.classification.classification) {
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
        return (
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
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
