/**
 * @file productivity-types.ts
 * @description
 * Declares interfaces related to the productivity classification workflow:
 * capturing user screen usage blocks, classifying them, etc.
 *
 * Key Exports:
 * - ProductivityBlock: A chunk of time with classification
 * - ProductivityClassification: Summarized verdict from the LLM
 *
 * @notes
 * - "productive", "unproductive", and "break" are the main states.
 * - Additional metadata can be added as needed.
 */

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
}

/**
 * The classification label assigned by the LLM or aggregator.
 */
export type ProductivityClassification =
  | "productive"
  | "unproductive"
  | "break";
