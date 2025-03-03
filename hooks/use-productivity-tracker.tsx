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

import { useState, useEffect } from "react";
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
 * Hook for tracking and displaying productivity data
 *
 * This hook fetches productivity data that has been processed by the cron job
 * and doesn't perform any classification or scoring logic itself.
 */
export function useProductivityTracker() {
  const { settings, updateSettings } = usePipeSettings();
  const [blocks, setBlocks] = useState<ProductivityBlock[]>([]);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load productivity data and score from settings on mount
  useEffect(() => {
    if (settings) {
      setScore(settings.customSettings?.productivityScore || 0);
      fetchProductivityData();
    }
  }, [settings]);

  // Fetch productivity data from the server
  async function fetchProductivityData(lookbackIntervals: number = 7) {
    setLoading(true);
    setError(null);

    try {
      // Fetch the productivity data that has already been processed by the cron job
      const fetchedBlocks = await getProductivityData(lookbackIntervals);
      setBlocks(fetchedBlocks);
    } catch (err) {
      console.error("Failed to fetch productivity data:", err);
      if (err instanceof Error) {
        console.error(err.stack);
      }
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error fetching productivity data"
      );
    } finally {
      setLoading(false);
    }
  }

  // Force a refresh of productivity data (e.g., after role change)
  async function refreshProductivityData(lookbackIntervals: number = 7) {
    // Trigger the cron job to recalculate scores
    try {
      setLoading(true);
      const response = await fetch("/api/calcscore");
      const data = await response.json();

      if (data.success) {
        // Once calculation is complete, fetch the updated data
        await fetchProductivityData(lookbackIntervals);
        // Update the local score state from the response
        setScore(data.currentScore);
      } else {
        throw new Error(
          data.message || "Failed to recalculate productivity score"
        );
      }
    } catch (err) {
      console.error("Failed to refresh productivity data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error refreshing productivity data"
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
    refreshProductivityData,
    fetchProductivityData,
  };
}
