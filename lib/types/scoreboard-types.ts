/**
 * @file scoreboard-types.ts
 * @description
 * Declares interfaces to handle leaderboard or scoreboard entries.
 *
 * Key Exports:
 * - ScoreboardEntry: Basic structure for a row in a global leaderboard
 *
 * @notes
 * - This can be stored in ephemeral memory, local storage, or parted out
 *   to a real database in future expansions.
 */

/**
 * Represents a single entry on a leaderboard, storing the user's nickname,
 * current score, rank, and an ID if needed.
 */
export interface ScoreboardEntry {
  /**
   * A unique user identifier.
   */
  userId: string;

  /**
   * The user’s chosen nickname.
   */
  nickname: string;

  /**
   * The user’s productivity or game score.
   */
  score: number;

  /**
   * The user's rank within the leaderboard.
   * E.g., 1 for top, 2 for second place, etc.
   */
  rank: number;
}
