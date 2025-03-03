/**
 * @file classification-utils.ts
 * @description
 * Provides utilities for partitioning screen usage data into time-based blocks
 * and chunking text for large language model (LLM) classification.
 *
 * @dependencies
 * - None external besides standard libraries.  (Screenpipe data is processed externally.)
 *
 * @notes
 * - Step 5 specifically requires partitioning frames into 5-min intervals, plus text chunking.
 * - Actual classification is handled in later steps.
 */

import type { ContentItem } from "@screenpipe/js";
import { PRODUCTIVITY_SCORE_UPDATE_INTERVAL } from "@/config";

/**
 * A helper interface to represent items grouped in a time-based block.
 */
interface PartitionedBlock {
  startTime: string;
  endTime: string;
  items: ContentItem[];
}

/**
 * Partition the given ContentItems (frames) into N-minute blocks.
 * We assume the items are from a roughly 15-minute range, but we
 * generate 5-minute slices by default.
 *
 * @param items - The array of ContentItems (OCR/UI) from Screenpipe
 * @param blockDurationMins - The duration of each block in minutes (default=5)
 * @returns An array of PartitionedBlock, each with a time window and its items
 */
export function partitionIntoBlocks(
  items: ContentItem[],
  blockDurationMins: number = PRODUCTIVITY_SCORE_UPDATE_INTERVAL
): PartitionedBlock[] {
  if (!items || items.length === 0) return [];

  // Sort items by timestamp ascending
  const sortedItems = [...items].sort((a, b) => {
    const tsA = new Date(getTimestamp(a)).getTime();
    const tsB = new Date(getTimestamp(b)).getTime();
    return tsA - tsB;
  });

  // The earliest item determines the start. The latest item determines the end.
  const firstTimestamp = new Date(getTimestamp(sortedItems[0])).getTime();
  const lastTimestamp = new Date(
    getTimestamp(sortedItems[sortedItems.length - 1])
  ).getTime();

  // We'll iterate in N-minute increments from first to last
  const blockDurationMs = blockDurationMins * 60 * 1000;

  let currentBlockStart = firstTimestamp;
  let blocks: PartitionedBlock[] = [];

  while (currentBlockStart <= lastTimestamp) {
    const currentBlockEnd = currentBlockStart + blockDurationMs;

    // Collect items that fall into [currentBlockStart, currentBlockEnd)
    const blockItems: ContentItem[] = [];
    for (const item of sortedItems) {
      const itemTime = new Date(getTimestamp(item)).getTime();
      if (itemTime >= currentBlockStart && itemTime < currentBlockEnd) {
        blockItems.push(item);
      }
    }

    // If blockItems is non-empty, create a partition
    // Even if empty, we might want to track a block if we are doing break detection.
    blocks.push({
      startTime: new Date(currentBlockStart).toISOString(),
      endTime: new Date(currentBlockEnd).toISOString(),
      items: blockItems,
    });

    // Move to the next block
    currentBlockStart = currentBlockEnd;
  }

  return blocks;
}

/**
 * A helper to get the timestamp from a ContentItem, whether it's OCR or UI.
 * If none found, returns current time as fallback.
 */
function getTimestamp(item: ContentItem): string {
  switch (item.type) {
    case "OCR":
      return item.content.timestamp;
    case "UI":
      return item.content.timestamp;
    default:
      // Just fallback to now if we can't parse it
      return new Date().toISOString();
  }
}

/**
 * Options for text chunking, including size and anonymization.
 */
interface ChunkingOptions {
  chunkSize?: number; // approximate chunk size in characters
  anonymize?: boolean;
}

/**
 * Splits text into smaller chunks for LLM usage, optionally filtering out
 * sensitive content or personal data. (Simple placeholders for now.)
 *
 * @param text - The raw text to be chunked
 * @param options - Additional chunking preferences
 * @returns An array of chunked text segments
 */
export function chunkTextForLLM(
  text: string,
  options: ChunkingOptions = {}
): string[] {
  const {
    chunkSize = 300, // default approx 300 characters
    anonymize = false,
  } = options;

  // Basic anonymization placeholder:
  // Replace potential emails or secrets with "[REDACTED]"
  // (very naive approach for demonstration)
  let workingText = text;
  if (anonymize) {
    // Example: remove emails
    workingText = workingText.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g,
      "[REDACTED_EMAIL]"
    );
    // Example: remove phone numbers
    workingText = workingText.replace(/\+?\d[\d -]{8,}\d/g, "[REDACTED_PHONE]");
  }

  // Split into chunks by character length
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < workingText.length) {
    chunks.push(workingText.slice(cursor, cursor + chunkSize));
    cursor += chunkSize;
  }

  return chunks;
}
