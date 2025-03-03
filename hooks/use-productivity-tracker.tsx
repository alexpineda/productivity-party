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
import { usePipeSettings } from "@/hooks/use-pipe-settings";
import { PipeSettings } from "@/lib/types/settings-types";

/**
 * A convenience hook to unify the entire "pull data -> classify -> score" flow.
 * Not strictly required for the plugin, but helpful for a real-time or interactive UI scenario.
 */
export function useProductivityTracker() {
  const [blocks, setBlocks] = useState<ProductivityBlock[]>([]);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = usePipeSettings();

  /**
   * @function classifyAndScoreAllBlocks
   * @description
   * Retrieves the last 15 mins of blocks from getProductivityData(),
   * then calls classifyBlock() for each block, aggregates the final score,
   * and optionally stores it in user settings using updateUserScore().
   *
   * If successful, updates local state with fresh blocks and new total score.
   *
   * @param role User's role for classification
   * @param updateSettings Whether to persist score to settings
   */
  async function classifyAndScoreAllBlocks(
    currentSettings: Partial<PipeSettings>,
    role: string = "I'm a developer",
    updateSettings: boolean = true
  ) {
    setLoading(true);
    setError(null);

    try {
      if (!currentSettings) {
        throw new Error("No settings found");
      }
      // 1. Get settings to retrieve existing data
      const currentScore = currentSettings?.productivityScore || 0;
      const lastProcessedBlocks = currentSettings?.lastProcessedBlocks || [];

      // 2. Fetch raw blocks - these may include already processed ones
      const rawBlocks = await getProductivityData(3);

      // 3. Display the blocks - prioritize showing already processed blocks from settings
      let displayBlocks: ProductivityBlock[] = [];

      // Add any stored blocks first
      if (lastProcessedBlocks.length > 0) {
        displayBlocks = [...lastProcessedBlocks];
      }

      // Then add any new blocks not already processed
      for (const block of rawBlocks) {
        // Skip blocks that are already in displayBlocks (from lastProcessedBlocks)
        if (!displayBlocks.some((b) => b.id === block.id)) {
          if (!block.contentSummary || !block.contentSummary.trim()) {
            block.classification = "break";
          } else if (!block.processed) {
            // Only classify unprocessed blocks
            const result = await classifyBlock(block.contentSummary, role);
            block.classification = result;
          }
          displayBlocks.push(block);
        }
      }

      // Keep only the most recent blocks
      displayBlocks = displayBlocks.slice(-3);

      // Set score directly from settings (already updated by calcscore API)
      setBlocks(displayBlocks);
      setScore(currentScore);

      // Only update settings if explicitly requested
      if (updateSettings) {
        // Calculate delta from unprocessed blocks
        const unprocessedBlocks = displayBlocks.filter(
          (block) => !block.processed
        );
        if (unprocessedBlocks.length > 0) {
          const delta = await aggregateProductivityBlocks(unprocessedBlocks);
          const newScore = await updateUserScore(
            delta,
            true,
            unprocessedBlocks
          );
          setScore(newScore);
        }
      }
    } catch (err) {
      console.error("Failed to classify & score blocks:", err);
      if (err instanceof Error) {
        console.error(err.stack);
      }
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
