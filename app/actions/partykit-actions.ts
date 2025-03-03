/*
<ai_context>
Contains server actions for interacting with the PartyKit server.
</ai_context>
<recent_changes>
Created updatePartyKitScore function to update the user's productivity score in the PartyKit server.
Added getUserScore function to fetch the user's current score from the PartyKit server.
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

/**
 * @function getUserScore
 * @description
 * Server action that fetches the user's current score from the PartyKit server.
 * 
 * @returns Promise<number> The user's current score, or 0 if there was an error
 * 
 * @example
 * const score = await getUserScore(); // Get current user's score
 */
export async function getUserScore(): Promise<number> {
  try {
    // Get the PartyKit server URL from config
    const partyKitUrl = PARTYKIT_SERVER_URL;

    // Get the user's settings to retrieve their user ID
    const settings = await pipe.settings.getAll();
    const userId = settings.customSettings?.userId || settings.user?.id;

    if (!userId) {
      console.error("No user ID found in settings");
      return 0;
    }

    // Construct the URL for the PartyKit server with query parameters
    const url = new URL(`${partyKitUrl}/party/chat`);
    url.searchParams.append("type", "get_user_score");
    url.searchParams.append("userId", userId);

    // Send a GET request to the PartyKit server
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user score:", await response.text());
      return 0;
    }

    const data = await response.json();
    return data.score || 0;
  } catch (error) {
    console.error("Error fetching user score:", error);
    return 0;
  }
}
