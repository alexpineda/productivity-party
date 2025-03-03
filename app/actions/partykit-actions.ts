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
import { PARTYKIT_SERVER_URL } from "@/config";

/**
 * @function updatePartyKitScore
 * @description
 * Server action that updates the user's score in the PartyKit server.
 * This keeps the leaderboard in sync with the user's productivity score.
 *
 * @param delta The score delta to apply (will be added to current score)
 * @returns Promise<boolean> indicating success or failure
 *
 * @example
 * const success = await updatePartyKitScore(5); // Add 5 points to user's score
 */
export async function updatePartyKitScore(delta: number): Promise<boolean> {
  try {
    // Get the PartyKit server URL from config
    const partyKitUrl = PARTYKIT_SERVER_URL;

    // Get the user's settings to retrieve their user ID
    const settings = await pipe.settings.getAll();
    const userId = settings.customSettings?.userId || settings.user?.id;

    if (!userId) {
      console.error("No user ID found in settings");
      return false;
    }

    // Construct the URL for the PartyKit server
    // The URL in config already includes the protocol
    const url = `${partyKitUrl}/party/chat`;

    // Send a POST request to the PartyKit server
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "update_score",
        userId,
        delta,
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
