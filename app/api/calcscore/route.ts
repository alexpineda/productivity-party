// app/api/calcscore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { processAndScoreNewBlocks } from "@/app/actions/productivity-actions";
import { appendToLog } from "@/lib/utilities/log-utils";
import { pipe } from "@screenpipe/js";
import { isProduction } from "@/config";

/**
 * GET route handler for /api/calcscore
 *
 * Cron job functionality to update scores and store in pipe settings
 */
export async function GET(request: NextRequest) {
  try {
    appendToLog(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) +
        " API call: calcscore " +
        (isProduction ? "production" : "development")
    );

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
      currentScore,
    });
  } catch (error: any) {
    console.error("calcscore route error:", error);
    appendToLog(`calcscore API error: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
