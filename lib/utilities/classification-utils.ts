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
import type { RawContentItem, PartitionedBlock } from "@/lib/types/productivity-types";

/**
 * Partition the given ContentItems (frames) into N-minute blocks.
 * We assume the items are from a roughly 15-minute range, but we
 * generate 5-minute slices by default. Block times are aligned to local
 * timezone 5-minute boundaries (e.g., 9:00, 9:05, 9:10).
 *
 * This function supports both ContentItem from @screenpipe/js and our internal RawContentItem type
 *
 * @param items - The array of ContentItems/RawContentItems (OCR/UI) from Screenpipe
 * @param blockDurationMins - The duration of each block in minutes (default=5)
 * @returns An array of PartitionedBlock, each with a time window and its items
 */
export function partitionIntoBlocks(
  items: (ContentItem | RawContentItem)[],
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
  const firstTimestamp = new Date(getTimestamp(sortedItems[0]));
  const lastTimestamp = new Date(
    getTimestamp(sortedItems[sortedItems.length - 1])
  ).getTime();

  // We'll iterate in N-minute increments from first to last
  const blockDurationMs = blockDurationMins * 60 * 1000;

  // Round the earliest timestamp to local 5-min boundary
  const startDate = new Date(firstTimestamp);
  const minutes = startDate.getMinutes();
  const normalizedMinutes = Math.floor(minutes / blockDurationMins) * blockDurationMins;
  startDate.setMinutes(normalizedMinutes, 0, 0); // zero out seconds and milliseconds
  
  let currentBlockStart = startDate.getTime();
  let blocks: PartitionedBlock[] = [];

  while (currentBlockStart <= lastTimestamp) {
    const currentBlockEnd = currentBlockStart + blockDurationMs;

    // Collect items that fall into [currentBlockStart, currentBlockEnd)
    const blockItems: RawContentItem[] = [];
    for (const item of sortedItems) {
      const itemTime = new Date(getTimestamp(item)).getTime();
      if (itemTime >= currentBlockStart && itemTime < currentBlockEnd) {
        // Cast to RawContentItem since we're now consistently using that type
        blockItems.push(item as RawContentItem);
      }
    }

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
 * A helper to get the timestamp from a ContentItem or RawContentItem, whether it's OCR or UI.
 * If none found, returns current time as fallback.
 */
function getTimestamp(item: ContentItem | RawContentItem): string {
  // Check if item has a 'timestamp' property directly (RawContentItem)
  if ('timestamp' in item && typeof item.timestamp === 'string') {
    return item.timestamp;
  }
  
  // Otherwise check for nested timestamp in content (ContentItem)
  switch (item.type) {
    case "OCR":
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
