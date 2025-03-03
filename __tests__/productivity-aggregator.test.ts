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
  it("should sum up blocks with productive => +1, unproductive => -1, break => 0", async () => {
    const blocks: ProductivityBlock[] = [
      {
        startTime: "2025-03-01T10:00:00Z",
        endTime: "2025-03-01T10:05:00Z",
        classification: {
          classification: "productive",
          shortSummary: "",
          reason: "",
        },
        contentSummary: "",
      } as ProductivityBlock,
      {
        startTime: "2025-03-01T10:05:00Z",
        endTime: "2025-03-01T10:10:00Z",
        classification: {
          classification: "unproductive",
          shortSummary: "",
          reason: "",
        },
        contentSummary: "",
      } as ProductivityBlock,
      {
        startTime: "2025-03-01T10:10:00Z",
        endTime: "2025-03-01T10:15:00Z",
        classification: {
          classification: "break",
          shortSummary: "",
          reason: "",
        },
        contentSummary: "",
      } as ProductivityBlock,
    ];
    // net result => +1 -1 +0 = 0
    const result = await aggregateProductivityBlocks(blocks);
    expect(result).toBe(0);
  });

  it("should support partial activeRatio weighting", async () => {
    const blocks: ProductivityBlock[] = [
      {
        startTime: "2025-03-01T10:00:00Z",
        endTime: "2025-03-01T10:05:00Z",
        classification: {
          classification: "productive",
          shortSummary: "",
          reason: "",
        },
        activeRatio: 0.5, // partial block
        contentSummary: "",
      },
      {
        startTime: "2025-03-01T10:05:00Z",
        endTime: "2025-03-01T10:10:00Z",
        classification: {
          classification: "productive",
          shortSummary: "",
          reason: "",
        },
        contentSummary: "",
      } as ProductivityBlock,
      {
        startTime: "2025-03-01T10:10:00Z",
        endTime: "2025-03-01T10:15:00Z",
        classification: {
          classification: "unproductive",
          shortSummary: "",
          reason: "",
        },
        activeRatio: 0.25,
        contentSummary: "",
      },
    ];
    // sum => +0.5 +1 -0.25 = 1.25 => round => 1
    const result = await aggregateProductivityBlocks(blocks);
    expect(result).toBe(1);
  });

  it("should treat unknown classification as break (0)", async () => {
    const blocks = [
      {
        startTime: "2025-03-01T10:00:00Z",
        endTime: "2025-03-01T10:05:00Z",
        classification: "some-future-unhandled-state" as any,
        activeRatio: 1,
        contentSummary: "",
      },
    ] as ProductivityBlock[];
    const result = await aggregateProductivityBlocks(blocks);
    expect(result).toBe(0);
  });
});
