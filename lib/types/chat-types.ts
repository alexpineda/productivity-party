/**
 * @file chat-types.ts
 * @description
 * Defines interfaces for chat-related data structures used in this plugin,
 * particularly relevant to PartyKit or other real-time messaging systems.
 *
 * Key Exports:
 * - ChatMessage: Basic structure of a chat message
 * - ConnectionState: Represents ephemeral user state (e.g., username)
 *
 * @notes
 * - This is used by `party-server/server.ts` to unify the data shape for
 *   onMessage handlers and for storing messages in memory or storage.
 */

/**
 * Represents a single chat message in our real-time group chat.
 */
export interface ChatMessage {
  /**
   * The type of message—commonly "chat", but could be extended.
   */
  type: string;

  /**
   * The nickname or identifier of the user who sent the message.
   */
  from: string;

  /**
   * The actual chat text content.
   */
  text: string;

  /**
   * Timestamp (as a number) indicating when the message was created.
   * Typically in milliseconds since epoch.
   */
  timestamp: number;
}

/**
 * Represents the ephemeral state for a connected user in the chat.
 * Stored on the PartyKit connection object.
 */
export interface ConnectionState {
  /**
   * The user’s nickname or display name.
   */
  username: string;

  /**
   * The current user productivity score, if relevant.
   * Could be used for a scoreboard in the future.
   */
  score: number;

  /**
   * The user’s current task or status text (optional usage).
   */
  task: string;
}
