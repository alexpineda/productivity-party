/*
<ai_context>
Contains server actions for interacting with the PartyKit server.
</ai_context>
<recent_changes>
Created updatePartyKitScore function to update the user's productivity score in the PartyKit server.
</recent_changes>
*/

"use server";

import { pipe } from "@screenpipe/js";

/**
 * @function updatePartyKitScore
 * @description
 * Server action that updates the user's score in the PartyKit server.
 * This keeps the leaderboard in sync with the user's productivity score.
 *
 * @param score The new total score to set
 * @returns Promise<boolean> indicating success or failure
 *
 * @example
 * const success = await updatePartyKitScore(42);
 */
export async function updatePartyKitScore(score: number): Promise<boolean> {
  try {
    // Get the PartyKit host from environment or use localhost for development
    const isDev = process.env.NODE_ENV !== "production";
    const host = isDev
      ? "localhost:1999"
      : process.env.NEXT_PUBLIC_PARTYKIT_HOST;

    if (!host) {
      console.error("NEXT_PUBLIC_PARTYKIT_HOST is not set");
      return false;
    }

    // Get the user's settings to retrieve their user ID
    const settings = await pipe.settings.getAll();
    const userId = settings.customSettings?.userId || settings.user?.id;

    if (!userId) {
      console.error("No user ID found in settings");
      return false;
    }

    // Construct the URL for the PartyKit server
    const protocol = isDev ? "http" : "https";
    const url = `${protocol}://${host}/party/chat`;

    // Send a POST request to the PartyKit server
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "set_score",
        userId,
        score,
      }),
    });

    if (!response.ok) {
      console.error("Failed to update PartyKit score:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating PartyKit score:", error);
    return false;
  }
}
