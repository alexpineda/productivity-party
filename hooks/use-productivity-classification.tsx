/**
 * @file use-productivity-classification.tsx
 * @description
 * Provides a React hook that retrieves recent productivity data (screen usage) from the server
 * and stores it in React state. This sets the stage for classification steps in upcoming phases.
 *
 * @dependencies
 * - React (client side)
 * - getProductivityData (server action)
 * - ProductivityBlock type
 *
 * @notes
 * - In Step 5, we only do retrieval and chunking, no actual LLM classification.
 * - In Step 6, we’ll add a call to the classification endpoint to label blocks as productive/unproductive.
 */

"use client";

import { useState } from "react";
import type { ProductivityBlock } from "@/lib/types/productivity-types";
import { getProductivityData } from "@/app/actions/productivity-actions";

/**
 * Hook to fetch partitioned + chunked productivity data from the server.
 * @returns - state, loading, error, and a function to refetch
 */
export function useProductivityClassification() {
  const [blocks, setBlocks] = useState<ProductivityBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiates a fetch of the last 15 minutes of screen usage,
   * partitioned into 5-minute blocks, and chunked text inside each block.
   */
  async function fetchProductivityData() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductivityData();
      setBlocks(data);
    } catch (err) {
      console.error("Failed to fetch productivity data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error occurred in useProductivityClassification"
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    blocks,
    loading,
    error,
    fetchProductivityData,
  };
}
