/*
<ai_context>
Contains server actions for interacting with the PartyKit server.
</ai_context>
<recent_changes>
Created updatePartyKitScore function to update the user's productivity score in the PartyKit server.
Added getUserScore function to fetch the user's current score from the PartyKit server.
Added getPartyServerHealth function to check the health of the PartyKit server.
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

/**
 * Interface for PartyKit server health response
 */
export interface PartyServerHealth {
  status: string;
  timestamp: number;
  connections: number;
  memory?: {
    scoreboardCacheSize: number;
    messagesQueueSize: number;
    rateLimitersCount: number;
  };
  error?: string;
}

/**
 * @function getPartyServerHealth
 * @description
 * Server action that checks the health of the PartyKit server.
 * This is useful for monitoring the server's status and performance.
 *
 * @returns Promise<PartyServerHealth> Object containing health information
 *
 * @example
 * const health = await getPartyServerHealth();
 * console.log(`Server status: ${health.status}, Connections: ${health.connections}`);
 */
export async function getPartyServerHealth(): Promise<PartyServerHealth> {
  try {
    // Get the PartyKit server URL from config
    const partyKitUrl = PARTYKIT_SERVER_URL;

    // Construct the URL for the health endpoint
    const url = `${partyKitUrl}/party/health`;

    console.log("Checking PartyKit server health at:", url);
    // Send a GET request to the health endpoint
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      // Add a short timeout to avoid hanging if the server is down
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error("Failed to fetch server health:", await response.text());
      return {
        status: "error",
        timestamp: Date.now(),
        connections: 0,
        error: `HTTP error ${response.status}`,
      };
    }

    const healthData: PartyServerHealth = await response.json();
    return healthData;
  } catch (error) {
    console.error("Error checking PartyKit server health:", error);
    return {
      status: "error",
      timestamp: Date.now(),
      connections: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
