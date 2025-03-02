/**
 * @file productivity-aggregator.test.ts
 * @description
 * Tests for aggregator logic in productivity-actions.ts, focusing on
 * the `aggregateProductivityBlocks` function.
 *
 * Key features tested:
 * - Summation of "productive" => +1
 * - Summation of "unproductive" => -1
 * - "break" => 0
 * - partial activeRatio weighting
 *
 * @dependencies
 * - vitest for the test runner
 *
 * @notes
 * - We do not test the database or network calls here. It's purely local aggregator logic.
 */

import { describe, it, expect } from "vitest";
import { aggregateProductivityBlocks } from "@/app/actions/productivity-actions";
import type { ProductivityBlock } from "@/lib/types/productivity-types";

describe("aggregateProductivityBlocks function", () => {
  it("should sum up blocks with productive => +1, unproductive => -1, break => 0", () => {
    const blocks: ProductivityBlock[] = [
      {
        startTime: "2025-03-01T10:00:00Z",
        endTime: "2025-03-01T10:05:00Z",
        classification: "productive",
      } as ProductivityBlock,
      {
        startTime: "2025-03-01T10:05:00Z",
        endTime: "2025-03-01T10:10:00Z",
        classification: "unproductive",
      } as ProductivityBlock,
      {
        startTime: "2025-03-01T10:10:00Z",
        endTime: "2025-03-01T10:15:00Z",
        classification: "break",
      } as ProductivityBlock,
    ];
    // net result => +1 -1 +0 = 0
    const result = aggregateProductivityBlocks(blocks);
    expect(result).toBe(0);
  });

  it("should support partial activeRatio weighting", () => {
    const blocks: ProductivityBlock[] = [
      {
        startTime: "2025-03-01T10:00:00Z",
        endTime: "2025-03-01T10:05:00Z",
        classification: "productive",
        activeRatio: 0.5, // partial block
      },
      {
        startTime: "2025-03-01T10:05:00Z",
        endTime: "2025-03-01T10:10:00Z",
        classification: "productive",
      } as ProductivityBlock,
      {
        startTime: "2025-03-01T10:10:00Z",
        endTime: "2025-03-01T10:15:00Z",
        classification: "unproductive",
        activeRatio: 0.25,
      },
    ];
    // sum => +0.5 +1 -0.25 = 1.25 => round => 1
    const result = aggregateProductivityBlocks(blocks);
    expect(result).toBe(1);
  });

  it("should treat unknown classification as break (0)", () => {
    const blocks = [
      {
        startTime: "2025-03-01T10:00:00Z",
        endTime: "2025-03-01T10:05:00Z",
        classification: "some-future-unhandled-state" as any,
        activeRatio: 1,
      },
    ] as ProductivityBlock[];
    const result = aggregateProductivityBlocks(blocks);
    expect(result).toBe(0);
  });
});
