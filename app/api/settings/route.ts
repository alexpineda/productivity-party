/*
<ai_context>
API endpoint to fetch Screenpipe settings for use in client components.
</ai_context>
<recent_changes>
Created a new API endpoint to safely fetch Screenpipe settings.
</recent_changes>
*/

import { NextResponse } from "next/server";
import { pipe } from "@screenpipe/js";

export async function GET() {
  try {
    // Get all settings from Screenpipe
    const settings = await pipe.settings.getAll();

    // Filter out sensitive information before sending to client
    const safeSettings = {
      aiProviderType: settings.aiProviderType,
      aiModel: settings.aiModel,
      dataDir: settings.dataDir,
      disableAudio: settings.disableAudio,
      disableVision: settings.disableVision,
      enableFrameCache: settings.enableFrameCache,
      enableUiMonitoring: settings.enableUiMonitoring,
      analyticsEnabled: settings.analyticsEnabled,
      // Include user info but remove sensitive fields
      user: settings.user
        ? {
            id: settings.user.id,
            email: settings.user.email,
            name: settings.user.name,
            image: settings.user.image,
            // Exclude token and other sensitive fields
          }
        : null,
      // Include any custom settings
      customSettings: settings.customSettings,
      // Add any other non-sensitive settings as needed
    };

    return NextResponse.json(safeSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
