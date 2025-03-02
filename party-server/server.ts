/**
 * @file server.ts
 * @description
 * The PartyKit server code for real-time chat and ephemeral scoreboard management,
 * now enhanced with OpenAI moderation. Each user can be shadow banned after
 * multiple flagged messages.
 *
 * Key Features:
 * 1. Real-time Chat:
 *    - onMessage with type="chat" calls `moderateMessage` to check content
 *    - If flagged => discard; increment warningCount
 *    - If user hits 3 flagged messages => set shadowBanned=true
 *    - Shadow banned users can see their own messages but no one else can see them
 * 2. Global Scoreboard:
 *    - "set_score" message updates ephemeral scoreboard and broadcasts
 *    - scoreboard is stored in room.storage, ephemeral
 * 3. ephemeral ConnectionState:
 *    - username: string
 *    - score: number
 *    - task: string
 *    - warningCount: number (times they've posted flagged content)
 *    - shadowBanned: boolean (true if they've exceeded flagged content threshold)
 *
 * Usage:
 *  - Deployed via `partykit dev` or `partykit deploy`
 *  - Client uses party-kit/party-kit-client.ts to connect
 *
 * @notes
 * - This step is a partial example. If you need persistent bans across restarts,
 *   store them in a real DB. Right now it's ephemeral.
 * - We do not automatically notify the user they've been banned beyond
 *   their messages not appearing. This can be improved if desired.
 */

import type * as Party from "partykit/server";
import { moderateMessage } from "@/app/actions/moderation";

// Basic chat message structure
interface ChatMessage {
  type: "chat";
  from: string;
  text: string;
  timestamp: number;
}

// Debug state message structure
interface DebugStateMessage {
  type: "debug_state";
  requesterId: string;
  userState: ConnectionState;
  allUsers: {
    id: string;
    state: ConnectionState;
  }[];
  timestamp: number;
}

// The ephemeral user state in this server
interface ConnectionState {
  userId: string;
  username: string;
  score: number;
  task: string;
  warningCount: number; // how many flagged messages
  shadowBanned: boolean; // if user is shadow banned
}

// Scoreboard entry in ephemeral memory
interface ScoreboardEntry {
  userId: string;
  username: string;
  score: number;
}

// Max saved messages to keep in ephemeral storage
const MAX_MESSAGES = 1000;
// Max times a user can post flagged content before shadow ban
const MAX_WARNINGS = 3;

/**
 * ChatServer
 * @description A PartyKit server handling chat + scoreboard. Now includes
 * message moderation with repeated flags => shadow ban.
 */
export default class ChatServer implements Party.Server {
  constructor(public room: Party.Room) {}

  /**
   * onConnect
   * Called when a user connects to the PartyKit room.
   * We set default ephemeral user state, then send them existing chat messages
   * and scoreboard data.
   */
  async onConnect(connection: Party.Connection<ConnectionState>) {
    // Set default ephemeral user state
    connection.setState({
      username: "Anonymous",
      score: 0,
      task: "none",
      warningCount: 0,
      shadowBanned: false,
      userId: connection.id,
    });

    // Retrieve existing messages from ephemeral storage
    const messages =
      (await this.room.storage.get<ChatMessage[]>("messages")) ?? [];

    // Send them to the newly connected user
    for (const msg of messages) {
      connection.send(JSON.stringify(msg));
    }

    // Optionally broadcast scoreboard to just this user
    await this.broadcastScoreboardToConnection(connection);
  }

  /**
   * onMessage
   * Called when a user sends a message. We parse JSON, then handle it
   * based on its 'type'.
   *
   * Supported types:
   * - "set_name": user changes display name
   * - "chat": user sends chat text
   * - "set_score": user updates their scoreboard score
   * - "get_debug_state": returns debug information about user state
   */
  async onMessage(raw: string, sender: Party.Connection<ConnectionState>) {
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      // Not valid JSON, just ignore
      return;
    }

    switch (data.type) {
      case "hello": {
        if (data.userId) {
          const currentState = sender.state || {
            username: "Anonymous",
            score: 0,
            task: "none",
            warningCount: 0,
            shadowBanned: false,
            userId: sender.id,
          };

          sender.setState({
            ...currentState,
            userId: data.userId,
          });
        }
        break;
      }
      case "set_name": {
        // ephemeral rename
        const currentState = sender.state || {
          username: "Anonymous",
          score: 0,
          task: "none",
          warningCount: 0,
          shadowBanned: false,
          userId: sender.id,
        };
        sender.setState({
          ...currentState,
          username: data.name || "Anonymous",
        });
        break;
      }

      case "chat": {
        // If user is shadow banned, we do not broadcast
        // but we let them see their own message
        const currentState = sender.state || {
          username: "Anonymous",
          score: 0,
          task: "none",
          warningCount: 0,
          shadowBanned: false,
          userId: sender.id,
        };
        const { shadowBanned, username, warningCount } = currentState;
        const text = data.text || "";

        // Create the new ChatMessage
        const newMessage: ChatMessage = {
          type: "chat",
          from: username,
          text,
          timestamp: Date.now(),
        };

        // If shadow banned, only send back to user themself
        if (shadowBanned) {
          sender.send(JSON.stringify(newMessage));
          // do not broadcast or store
          return;
        }

        // Otherwise we do moderation
        const flagged = await moderateMessage(text);
        if (flagged) {
          // Discard or sanitize the message. We'll just discard
          // increment warning count
          const newCount = warningCount + 1;
          sender.setState({
            ...currentState,
            warningCount: newCount,
          });

          // Check if they exceed threshold => shadow ban them
          if (newCount >= MAX_WARNINGS) {
            sender.setState({
              ...currentState,
              shadowBanned: true,
            });
            // we can optionally send them a private message about the ban
            const banMsg: ChatMessage = {
              type: "chat",
              from: "System",
              text: "You have been shadow banned for repeated TOS violations.",
              timestamp: Date.now(),
            };
            sender.send(JSON.stringify(banMsg));
          }
          // We do NOT broadcast flagged content
          return;
        }

        // If not flagged => store + broadcast
        const messages =
          (await this.room.storage.get<ChatMessage[]>("messages")) ?? [];
        messages.push(newMessage);
        // prune older messages
        if (messages.length > MAX_MESSAGES) {
          messages.splice(0, messages.length - MAX_MESSAGES);
        }
        await this.room.storage.put("messages", messages);

        // broadcast to everyone (except the original sender? up to you).
        // We'll broadcast to everyone for normal chat:
        this.room.broadcast(JSON.stringify(newMessage));
        break;
      }

      case "set_score": {
        /**
         * Example shape:
         * { type: "set_score", score: <number> }
         */
        const userId = sender.id;
        const newScore = typeof data.score === "number" ? data.score : 0;

        // update ephemeral connection state
        const currentState = sender.state || {
          username: "Anonymous",
          score: 0,
          task: "none",
          warningCount: 0,
          shadowBanned: false,
          userId: sender.id,
        };
        sender.setState({
          ...currentState,
          score: newScore,
        });

        // update scoreboard in ephemeral storage
        const scoreboard =
          (await this.room.storage.get<ScoreboardEntry[]>("scoreboard")) ?? [];

        // find existing entry by userId
        const idx = scoreboard.findIndex((e) => e.userId === userId);
        if (idx >= 0) {
          scoreboard[idx].score = newScore;
          scoreboard[idx].username = currentState.username;
        } else {
          scoreboard.push({
            userId,
            username: currentState.username || "Anonymous",
            score: newScore,
          });
        }

        // sort descending by score, then alpha by username
        scoreboard.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.username.localeCompare(b.username);
        });

        await this.room.storage.put("scoreboard", scoreboard);

        // broadcast scoreboard to all
        await this.broadcastScoreboard();
        break;
      }

      case "get_debug_state": {
        /**
         * Example shape:
         * { type: "get_debug_state" }
         *
         * Returns the user's current state and all connected users' states
         */
        const currentState = sender.state || {
          username: "Anonymous",
          score: 0,
          task: "none",
          warningCount: 0,
          shadowBanned: false,
          userId: sender.id,
        };

        // Get all connected users
        const connections = Array.from(this.room.connections.entries());
        const allUsers = connections.map(([id, conn]) => ({
          id,
          state: (conn.state as ConnectionState) || {
            username: "Unknown",
            score: 0,
            task: "none",
            warningCount: 0,
            shadowBanned: false,
            userId: id,
          },
        }));

        // Create debug state message
        const debugStateMsg: DebugStateMessage = {
          type: "debug_state",
          requesterId: sender.id,
          userState: currentState,
          allUsers,
          timestamp: Date.now(),
        };

        // Send only to the requesting user
        sender.send(JSON.stringify(debugStateMsg));
        break;
      }

      default:
        // unknown type => no-op
        break;
    }
  }

  /**
   * broadcastScoreboard
   * Reads scoreboard from ephemeral storage, sends to all
   */
  private async broadcastScoreboard() {
    const scoreboard =
      (await this.room.storage.get<ScoreboardEntry[]>("scoreboard")) ?? [];
    const msg = {
      type: "scoreboard",
      scoreboard,
    };
    this.room.broadcast(JSON.stringify(msg));
  }

  /**
   * broadcastScoreboardToConnection
   * same as broadcastScoreboard, but only to the specified connection
   */
  private async broadcastScoreboardToConnection(
    connection: Party.Connection<ConnectionState>
  ) {
    const scoreboard =
      (await this.room.storage.get<ScoreboardEntry[]>("scoreboard")) ?? [];
    const msg = {
      type: "scoreboard",
      scoreboard,
    };
    connection.send(JSON.stringify(msg));
  }
}
