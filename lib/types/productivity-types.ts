/**
 * @file productivity-types.ts
 * @description
 * Declares interfaces related to the productivity classification workflow:
 * capturing user screen usage blocks, classifying them, etc.
 *
 * Key Exports:
 * - RawContentItem: Individual content item from ScreenPipe API
 * - PartitionedBlock: Raw content items grouped by time
 * - ProductivityBlock: A processed chunk of time with classification
 * - ProductivityClassification: Summarized verdict from the LLM
 *
 * @notes
 * - "productive", "unproductive", and "break" are the main states.
 * - Additional metadata can be added as needed.
 */

/**
 * Raw content item from the ScreenPipe API
 */
export interface RawContentItem {
  id: string;
  timestamp: string;
  type: string; // "OCR" or "UI" typically
  content: {
    text: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Represents a time-based partition of raw content items
 */
export interface PartitionedBlock {
  startTime: string;
  endTime: string;
  items: RawContentItem[];
}

/**
 * Represents a single block of user activity (e.g., a 5-minute window),
 * holding classification details, timestamps, and text data if needed.
 */
export interface ProductivityBlock {
  /**
   * ISO timestamp marking the start of this block.
   */
  startTime: string;

  /**
   * ISO timestamp marking the end of this block.
   */
  endTime: string;

  /**
   * Optional text or aggregated screen data used in classification.
   * This is only used during processing and should not be stored long-term.
   */
  contentSummary?: string;

  /**
   * Result of the LLM classification, typically:
   * 'productive', 'unproductive', or 'break'
   */
  classification: ProductivityClassification;

  /**
   * If this block is partially break and partially active,
   * we could store the fraction here to weigh the score.
   */
  activeRatio?: number;

  /**
   * Unique identifier for the block, typically based on timestamp
   */
  id?: string;

  /**
   * Flag to indicate if this block has been processed by the cron job
   */
  processed?: boolean;
}

/**
 * The classification label assigned by the LLM or aggregator.
 */
export type ProductivityClassification = {
  classification: "productive" | "unproductive" | "break";
  shortSummary: string;
  reason: string;
};
