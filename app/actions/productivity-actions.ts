/**
 * @file productivity-actions.ts
 * @description
 * Provides server actions for retrieving recent screen usage data (5-min blocks),
 * chunking text, classifying them, and now (Step 7) calculating a final user score.
 *
 * @exports
 * - getProductivityData(): Returns an array of ProductivityBlock objects from the last 15 minutes
 * - aggregateProductivityBlocks(blocks: ProductivityBlock[]): number
 *   Sums up the classification results for each block, returning a score delta
 * - updateUserScore(scoreDelta: number): Promise<number>
 *   Adds the given delta to the user's existing productivity score stored in
 *   pipe.settings -> customSettings.productivityScore
 *
 * Implementation details:
 * - "productive" => +1 * (activeRatio if any)
 * - "unproductive" => -1 * (activeRatio if any)
 * - "break" => 0
 * - If a block has no classification, default it to "break" or 0 effect
 * - partial blocks can set block.activeRatio < 1
 *
 * This completes the step of "Productivity Score Calculation" by providing
 * aggregator logic and a function to persist the updated score in user settings.
 */

"use server";
import { pipe } from "@screenpipe/js";
import type { ProductivityBlock } from "@/lib/types/productivity-types";
import {
  partitionIntoBlocks,
  chunkTextForLLM,
} from "@/lib/utilities/classification-utils";
import { updatePartyKitScore } from "./partykit-actions";
import { appendToLog } from "@/lib/utilities/log-utils";
import {
  PRODUCTIVITY_SCORE_UPDATE_INTERVAL,
  SCREENPIPE_API_URL,
} from "@/config";

/**
 * Fetch the last 15 minutes of screen usage from Screenpipe (OCR + UI),
 * partition it into 5-minute blocks, chunk text, and return as ProductivityBlock[].
 *
 * This version uses the HTTP API directly instead of the SDK.
 *
 * @returns Promise<ProductivityBlock[]>
 * @throws If screenpipe query fails or if there's a parsing error
 */
export async function getProductivityData(): Promise<ProductivityBlock[]> {
  const now = new Date();
  const timeRangeAgo = new Date(
    now.getTime() - PRODUCTIVITY_SCORE_UPDATE_INTERVAL * 60 * 1000
  );

  appendToLog("getProductivityData: using HTTP API");

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

    const { data: contentItems } = data;

    // Partition into 5-minute blocks
    const partitionedBlocks = partitionIntoBlocks(contentItems, 5);

    // Convert each partitioned block into a ProductivityBlock
    const productivityBlocks: ProductivityBlock[] = partitionedBlocks.map(
      (block) => {
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
          startTime: block.startTime,
          endTime: block.endTime,
          contentSummary,
          // Default classification is 'break' for now
          classification: "break",
          // We assume 100% active ratio for demonstration
          activeRatio: 1,
          aiDescription: "",
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
 * Server action that updates the user's stored productivity score by the given amount.
 *
 * The final score is persisted in pipe.settings -> customSettings.productivityScore.
 * If no previous score exists, we default to 0.
 *
 * @param scoreDelta A positive or negative integer
 * @returns The new total user score
 *
 * @example
 * const newScore = await updateUserScore(2); // adds +2
 */
export async function updateUserScore(
  scoreDelta: number,
  persist = true
): Promise<number> {
  // Retrieve the current settings
  const curSettings = await pipe.settings.getAll();

  // If there's a stored customScore, otherwise default to 0
  const currentScore =
    curSettings.customSettings?.productivityScore !== undefined
      ? Number(curSettings.customSettings.productivityScore)
      : 0;

  const newScore = currentScore + scoreDelta;

  if (persist) {
    // Save it back
    await pipe.settings.update({
      customSettings: {
        ...curSettings.customSettings,
        productivityScore: newScore,
      },
    });

    // Update the PartyKit server directly
    await updatePartyKitScore(newScore);
  }

  return newScore;
}
