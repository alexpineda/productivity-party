/**
 * @file moderation.ts
 * @description
 * Simple content moderation function for chat messages.
 * In a real implementation, this would use OpenAI's moderation API
 * or another content moderation service.
 */

"use server";

import { OpenAI } from "openai";
// import { pipe } from "@screenpipe/js";

/**
 * Checks if a message contains inappropriate content
 * @param text The message text to check
 * @returns True if the message is flagged as inappropriate, false otherwise
 */
export async function moderateMessage(text: string): Promise<boolean> {
  try {
    // Get settings to determine which API key to use
    // const settings = await pipe.settings.getAll();

    // Decide which key to use
    const apiKey = process.env.PARTYKIT_OPENAI_API_KEY;
    // settings.aiProviderType === "screenpipe-cloud"
    //   ? settings?.user?.token
    //   : settings?.openaiApiKey;

    if (!apiKey) {
      console.warn("No API key available for moderation, skipping check");
      return false;
    }

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey,
    });

    // Call moderation API
    const response = await openai.moderations.create({
      model: "text-moderation-latest",
      input: text,
    });

    // Check if the content was flagged
    return response.results[0]?.flagged || false;
  } catch (error) {
    console.error("Error in moderation:", error);
    // On error, we'll be cautious and not flag the content
    return false;
  }
}
