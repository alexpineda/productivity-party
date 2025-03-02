// app/api/calcscore/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getProductivityData,
  aggregateProductivityBlocks,
  updateUserScore,
} from "@/app/actions/productivity-actions";
import { classifyBlock } from "@/app/actions/classify-actions";

export async function GET(request: NextRequest) {
  try {
    // 1. Pull raw blocks for the last ~15 mins
    const blocks = await getProductivityData();

    // 2. Classify each block (if not already classified)
    //    This might be done individually, or you might do it in getProductivityData,
    //    depending on how you structured your code.
    for (const block of blocks) {
      if (!block.contentSummary?.trim()) {
        block.classification = "break";
        continue;
      }
      // Just a simple example. Real code might do chunk-by-chunk classification:
      const label = await classifyBlock(
        block.contentSummary,
        "I'm a developer"
      );
      block.classification = label;
    }

    // 3. Aggregate to get a score delta
    const scoreDelta = aggregateProductivityBlocks(blocks);

    // 4. Update user’s total score
    const newScore = await updateUserScore(scoreDelta);

    console.log("calcscore - updated user score:", { scoreDelta, newScore });

    return NextResponse.json({ success: true, scoreDelta, newScore });
  } catch (error: any) {
    console.error("calcscore route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
