// app/api/calcscore/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getProductivityData,
  aggregateProductivityBlocks,
  updateUserScore,
} from "@/app/actions/productivity-actions";
import { classifyBlock } from "@/app/actions/classify-actions";
import { appendToLog } from "@/lib/utilities/log-utils";
import type { ProductivityBlock } from "@/lib/types/productivity-types";
import { pipe } from "@screenpipe/js";

// export const runtime = "nodejs";

// Mock function for testing
async function getMockProductivityData(): Promise<ProductivityBlock[]> {
  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  // Create three 5-minute blocks with mock data
  return [
    {
      startTime: fifteenMinutesAgo.toISOString(),
      endTime: tenMinutesAgo.toISOString(),
      contentSummary:
        "Working on React components for the dashboard. Implementing new features.",
      classification: "break", // Will be classified by the caller
      activeRatio: 1,
    },
    {
      startTime: tenMinutesAgo.toISOString(),
      endTime: fiveMinutesAgo.toISOString(),
      contentSummary: "Browsing social media. Checking Twitter and Instagram.",
      classification: "break", // Will be classified by the caller
      activeRatio: 1,
    },
    {
      startTime: fiveMinutesAgo.toISOString(),
      endTime: now.toISOString(),
      contentSummary:
        "Reading documentation about Next.js API routes and server actions.",
      classification: "break", // Will be classified by the caller
      activeRatio: 1,
    },
  ] as ProductivityBlock[];
}

export async function GET(request: NextRequest) {
  try {
    appendToLog(new Date().toISOString() + " cron job: calcscore");

    // Get user's role from settings
    const settings = await pipe.settings.getAll();
    const userRole = settings.customSettings?.pipe?.role || "I'm a developer"; // Default to developer if no role set

    // 1. Pull raw blocks for the last ~15 mins
    // Use mock data for testing instead of the real function
    const blocks = await getProductivityData();
    // const blocks = await getMockProductivityData();

    appendToLog(blocks);
    // 2. Classify each block (if not already classified)
    //    This might be done individually, or you might do it in getProductivityData,
    //    depending on how you structured your code.
    for (const block of blocks) {
      if (!block.contentSummary?.trim()) {
        block.classification = "break";
        continue;
      }
      // Pass the user's role to classifyBlock
      const label = await classifyBlock(block.contentSummary, userRole);
      block.classification = label;
    }

    // 3. Aggregate to get a score delta
    const scoreDelta = await aggregateProductivityBlocks(blocks);

    // 4. Update user's total score
    const newScore = await updateUserScore(scoreDelta);

    appendToLog({ scoreDelta, newScore });

    return NextResponse.json({ success: true, scoreDelta, newScore });
  } catch (error: any) {
    console.error("calcscore route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
