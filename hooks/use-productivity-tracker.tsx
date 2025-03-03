/**
 * @file use-productivity-tracker.tsx
 * @description
 * A client-side hook that coordinates classification, aggregation, and score updates.
 *
 * Implementation:
 * - We rely on existing hooks or actions:
 *   - getProductivityData() from productivity-actions (fetch blocks)
 *   - classifyBlock() from classify-actions (classify each block's text)
 *   - aggregateProductivityBlocks() to sum up the classifications
 *   - updateUserScore() to persist the final score
 *
 * This example function classifyAndScoreAllBlocks() shows how you could do it:
 *   1. fetch the raw blocks
 *   2. classify each block with your LLM
 *   3. aggregate the final score
 *   4. update user score in settings
 *
 * Key Exports:
 * - useProductivityTracker: Returns { blocks, score, loading, error, classifyAndScoreAllBlocks }
 *
 * @dependencies
 * - React for state management
 * - classifyBlock from classify-actions
 * - getProductivityData, aggregateProductivityBlocks, updateUserScore from productivity-actions
 */

"use client";

import { useState } from "react";
import type { ProductivityBlock } from "@/lib/types/productivity-types";
import {
  getProductivityData,
  aggregateProductivityBlocks,
  updateUserScore,
} from "@/app/actions/productivity-actions";
import { classifyBlock } from "@/app/actions/classify-actions";
import { summarizeText } from "@/app/actions/summarize-actions";

/**
 * A convenience hook to unify the entire "pull data -> classify -> score" flow.
 * Not strictly required for the plugin, but helpful for a real-time or interactive UI scenario.
 */
export function useProductivityTracker() {
  const [blocks, setBlocks] = useState<ProductivityBlock[]>([]);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @function classifyAndScoreAllBlocks
   * @description
   * Retrieves the last 15 mins of blocks from getProductivityData(),
   * then calls classifyBlock() for each block, aggregates the final score,
   * and stores it in user settings using updateUserScore().
   *
   * If successful, updates local state with fresh blocks and new total score.
   */
  async function classifyAndScoreAllBlocks(
    role: string = "I'm a developer",
    limit?: number
  ) {
    setLoading(true);
    setError(null);

    try {
      // 1. fetch raw blocks
      const rawBlocks = await getProductivityData();

      // 2. classify each block
      //    For demonstration, we pass block.contentSummary to classifyBlock
      //    and store the result
      const classifiedBlocks: ProductivityBlock[] = [];
      for (const block of rawBlocks) {
        if (!block.contentSummary || !block.contentSummary.trim()) {
          // If no text or break, skip classification
          block.classification = "break";
        } else {
          const result = await classifyBlock(block.contentSummary, role);
          block.classification = result;
        }
        classifiedBlocks.push(block);
      }

      // 3. aggregate the final score
      const delta = await aggregateProductivityBlocks(classifiedBlocks);

      // 4. persist in user settings
      const newScore = await updateUserScore(delta, false);

      // 5. update local state
      setBlocks(classifiedBlocks);
      setScore(newScore);
    } catch (err) {
      console.error("Failed to classify & score blocks:", err);
      setError(
        err instanceof Error ? err.message : "Unknown error in classification"
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    blocks,
    score,
    loading,
    error,
    classifyAndScoreAllBlocks,
  };
}
