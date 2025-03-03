// app/api/calcscore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { processAndScoreNewBlocks } from "@/app/actions/productivity-actions";
import { appendToLog } from "@/lib/utilities/log-utils";
import { pipe } from "@screenpipe/js";

/**
 * GET route handler for /api/calcscore
 * 
 * This endpoint is a thin wrapper around the processAndScoreNewBlocks function
 * which handles the entire pipeline of fetching unprocessed blocks, classifying them,
 * calculating score delta, and updating the user's score.
 * 
 * It can be triggered by a cron job or manually by the user.
 */
export async function GET(request: NextRequest) {
  try {
    appendToLog(new Date().toISOString() + " API call: calcscore");

    // Get user's role from settings
    const settings = await pipe.settings.getAll();
    const userRole = settings.customSettings?.pipe?.role || "I'm a developer"; // Default to developer if no role set
    const currentScore = settings.customSettings?.productivityScore || 0;

    // Process all unprocessed blocks
    await processAndScoreNewBlocks(userRole, 3);
    
    // Return a simple success response with the current score
    return NextResponse.json({
      success: true,
      message: "Blocks processed successfully",
      currentScore
    });
  } catch (error: any) {
    console.error("calcscore route error:", error);
    appendToLog(`calcscore API error: ${error.message}`);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
