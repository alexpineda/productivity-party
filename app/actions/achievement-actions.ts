/**
 * @file achievement-actions.ts
 * @description
 * Provides server actions for awarding achievements when a user’s productivity
 * score crosses certain thresholds. Achievements are stored in `pipe.settings`
 * under the `customSettings.achievements` array.
 *
 * Exports:
 * 1. checkAndUnlockAchievements(newScore: number) => Promise<Achievement[]>
 *    - Compares newScore to known thresholds
 *    - If the user crosses a threshold for the first time, we store the new
 *      achievement in settings
 *    - Returns an array of newly unlocked achievements
 *
 * 2. getUserAchievements() => Promise<Achievement[]>
 *    - Returns the user’s currently unlocked achievements
 *
 * Key Implementation Details:
 * - Achievements are identified by an `id` (string)
 * - The user’s achievements are stored in `customSettings.achievements`
 *   as an array of strings (the 'id's). We then cross-reference them with
 *   a local `ACHIEVEMENT_DEFINITIONS` object to get full details.
 * - You can tweak thresholds or add more achievements as needed.
 *
 * @notes
 * - Achievements are purely for demonstration. You might want to localize text
 *   or store them in a more robust data store if needed.
 * - If you have partial or advanced scoring, adjust thresholds accordingly.
 */

"use server";

import { pipe } from "@screenpipe/js";

/**
 * An interface describing a single Achievement object
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  threshold: number; // The minimum score at which this achievement unlocks
}

/**
 * A static list of achievements we can unlock, keyed by ID.
 * You can add more or adjust thresholds.
 */
const ACHIEVEMENT_DEFINITIONS: Record<string, Achievement> = {
  "score-10": {
    id: "score-10",
    name: "Rookie Achiever",
    description: "Reached a score of 10! Keep going!",
    threshold: 10,
  },
  "score-50": {
    id: "score-50",
    name: "Productive Pro",
    description: "Reached a score of 50! You’re on a roll!",
    threshold: 50,
  },
  "score-100": {
    id: "score-100",
    name: "Master of Productivity",
    description: "Score of 100? Incredible dedication!",
    threshold: 100,
  },
};

/**
 * Checks if the given score passes any new thresholds (achievements)
 * that the user doesn't already have, and unlocks them.
 *
 * @param newScore The user's new total score
 * @returns An array of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(
  newScore: number
): Promise<Achievement[]> {
  try {
    // 1. Load user settings
    const settings = await pipe.settings.getAll();

    // 2. Get current achievements from user settings. If none, empty array
    const userAchievements: string[] =
      (settings.customSettings?.achievements as string[]) || [];

    // 3. Figure out which achievements are newly unlocked
    const newlyUnlocked: Achievement[] = [];
    for (const achId in ACHIEVEMENT_DEFINITIONS) {
      const ach = ACHIEVEMENT_DEFINITIONS[achId];
      // If user score is >= threshold and they don't have it yet
      if (newScore >= ach.threshold && !userAchievements.includes(achId)) {
        newlyUnlocked.push(ach);
      }
    }

    // If no new achievements, return early
    if (newlyUnlocked.length === 0) {
      return [];
    }

    // 4. Add the newly unlocked achievements' IDs to user settings
    const updatedAchievements = [...userAchievements];
    for (const ach of newlyUnlocked) {
      updatedAchievements.push(ach.id);
    }

    // 5. Save them
    await pipe.settings.update({
      customSettings: {
        ...settings.customSettings,
        achievements: updatedAchievements,
      },
    });

    // 6. Return newly unlocked achievements
    return newlyUnlocked;
  } catch (error) {
    console.error("checkAndUnlockAchievements() failed:", error);
    // On error, we’ll assume none unlocked
    return [];
  }
}

/**
 * Retrieves the user's currently unlocked achievements from settings
 *
 * @returns An array of Achievement objects
 */
export async function getUserAchievements(): Promise<Achievement[]> {
  try {
    const settings = await pipe.settings.getAll();
    const userAchievements = (settings.customSettings?.achievements ||
      []) as string[];

    // Map IDs to full Achievement details
    const result: Achievement[] = userAchievements
      .map((id) => ACHIEVEMENT_DEFINITIONS[id])
      .filter((ach) => ach !== undefined);

    return result;
  } catch (error) {
    console.error("getUserAchievements() failed:", error);
    return [];
  }
}
