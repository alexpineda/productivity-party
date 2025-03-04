/**
 * @file use-productivity-tracker.tsx
 * @description
 * A client-side hook that coordinates productivity data display and scoring.
 *
 * Implementation:
 * - This hook is primarily for UI display, not for classification/scoring
 * - Actual scoring happens via the /api/calcscore endpoint (via cron job)
 * - The hook provides methods to:
 *   1. Fetch and display historical productivity data
 *   2. Trigger the scoring pipeline via API when manually requested
 *
 * Key Exports:
 * - useProductivityTracker: Returns { blocks, score, loading, error, refreshProductivityData, fetchHistoricalData }
 *
 * @dependencies
 * - React for state management
 * - getProductivityData from productivity-actions
 * - PartyKit for getting real-time score updates
 */

"use client";

import { useState, useEffect } from "react";
import type { ProductivityBlock } from "@/lib/types/productivity-types";
import { getProcessedBlocks } from "@/app/actions/productivity-actions";
import { usePipeSettings } from "@/hooks/use-pipe-settings";

/**
 * Hook for displaying productivity data and managing score refresh
 *
 * This hook is primarily for UI display and doesn't handle classification
 * or scoring logic directly - that's done by the calcscore API endpoint.
 */
export function useProductivityTracker() {
  const { settings } = usePipeSettings();
  const [blocks, setBlocks] = useState<ProductivityBlock[]>([]);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load productivity score from settings on mount
  useEffect(() => {
    if (settings) {
      setScore(settings.customSettings?.productivityScore || 0);
      // On initial mount, fetch historical data
      fetchHistoricalData();
    }
  }, [settings]);

  /**
   * Fetch historical productivity data for display purposes
   * This fetches processed blocks from settings and ensures current blocks are up-to-date
   */
  async function fetchHistoricalData(lookbackIntervals: number = 7) {
    setLoading(true);
    setError(null);

    try {
      // Fetch processed blocks from settings
      const processedBlocks = await getProcessedBlocks();
      
      // Create a current block for the present time period
      // Round to the current 5-minute interval
      const now = new Date();
      
      // Calculate the current 5-minute block
      // For the next end time (ceiling), not floor
      const minutes = now.getMinutes();
      const nextIntervalMinutes = Math.ceil(minutes / 5) * 5;
      
      // Create end time (next 5-minute interval)
      const endDate = new Date(now);
      endDate.setMinutes(nextIntervalMinutes, 0, 0);
      
      // The start time is 5 minutes before end time
      const startDate = new Date(endDate);
      startDate.setMinutes(endDate.getMinutes() - 5);
      
      // Format for block ID - uses the start time
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const hours = String(startDate.getHours()).padStart(2, '0');
      const mins = String(startDate.getMinutes()).padStart(2, '0');
      const normalizedTimeStr = `${year}-${month}-${day}T${hours}:${mins}`;
      
      // Create a current block with status "in progress"
      const currentBlock = {
        id: `block-${normalizedTimeStr}`,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        classification: {
          classification: "productive", // Optimistic assumption
          shortSummary: "Currently tracking...",
          reason: "This time block is still in progress",
        },
        activeRatio: 1,
        processed: false
      };
      
      // Combine processed blocks with the current block
      const combinedBlocks = [...processedBlocks, currentBlock];
      
      // Sort blocks by time (newest first) and remove duplicates
      const blockMap = new Map();
      combinedBlocks.forEach(block => {
        // If block already exists in map, only replace if the new one is processed
        if (!blockMap.has(block.id) || block.processed) {
          blockMap.set(block.id, block);
        }
      });
      
      const sortedBlocks = Array.from(blockMap.values()).sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      setBlocks(sortedBlocks);
    } catch (err) {
      console.error("Failed to fetch historical productivity data:", err);
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

  /**
   * Force a refresh of productivity data and scoring
   * This triggers the calcscore API endpoint to process new blocks
   */
  async function refreshProductivityData(lookbackIntervals: number = 7) {
    try {
      setLoading(true);

      // 1. Trigger the calcscore endpoint to process new blocks and update score
      const response = await fetch("/api/calcscore");
      const data = await response.json();

      // Check if the request was successful
      if (data.success) {
        // 2. After processing completes, fetch updated historical data
        await fetchHistoricalData(lookbackIntervals);

        // 3. Use the score delta to update our local score state
        if (data.scoreDelta) {
          setScore((prevScore) => prevScore + data.scoreDelta);
        } else if (data.currentScore !== undefined) {
          // If we got a currentScore (no blocks processed case), use that
          setScore(data.currentScore);
        }

        // 4. If we got recent blocks, add them to our state
        if (data.recentBlocks && data.recentBlocks.length > 0) {
          setBlocks((prevBlocks) => {
            // Create a map of existing blocks by ID
            const blockMap = new Map(
              prevBlocks.map((block) => [block.id, block])
            );

            // Add new blocks to the map
            data.recentBlocks.forEach((block: ProductivityBlock) => {
              if (block.id) {
                blockMap.set(block.id, { ...block, processed: true });
              }
            });

            // Sort blocks by time
            return Array.from(blockMap.values()).sort(
              (a, b) =>
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime()
            );
          });
        }
      } else {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to recalculate productivity score"
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
    fetchHistoricalData,
  };
}
