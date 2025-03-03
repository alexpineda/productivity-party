/**
 * @file party-kit-client.ts
 * @description
 * Provides a React hook to connect to the PartyKit "chat" room.
 * It exposes methods for chat and scoreboard (like setScore).
 *
 * Key Exports:
 * - usePartyKitClient(): Returns { socket, setName, sendChat, setScore, getDebugState }
 *   for usage in any client component, including our new leaderboard page.
 *
 * Implementation:
 * - We create a single WebSocket-like connection to the PartyKit server at
 *   "chat-app.youruser.partykit.dev" room "chat" (example).
 * - The user can setName, sendChat, setScore, or getDebugState.
 * - We do not handle message events here; that remains up to each consumer.
 *
 * @notes
 * - This is purely an example. In a real deployment, you'd handle your domain more robustly.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { usePipeSettings } from "@/hooks/use-pipe-settings";
import { PARTYKIT_SERVER_URL } from "@/config";

const HOST = PARTYKIT_SERVER_URL;

if (!HOST) {
  throw new Error("PARTYKIT_SERVER_URL is not set");
}

// User state in the PartyKit server
interface ConnectionState {
  userId: string;
  username: string;
  score: number;
  task: string;
  warningCount: number;
  shadowBanned: boolean;
}

// Debug state message from server
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

/**
 * Our custom hook to unify the PartyKit connection
 */
export function usePartyKitClient() {
  const { settings } = usePipeSettings();
  const [socket, setSocket] = useState<PartySocket | null>(null);

  // Connect once on mount
  useEffect(() => {
    if (!settings) return;
    const userId = settings.screenpipeAppSettings?.user?.id;
    if (!userId) throw new Error("No user ID found");

    // adjust host or config as needed for local dev vs production
    const ws = new PartySocket({
      host: HOST!, // replace with your actual PartyKit dev host if needed
      room: "chat",
    });

    ws.addEventListener("open", () => {
      // As soon as the socket opens, send the user ID to the PartyKit server
      ws.send(
        JSON.stringify({
          type: "hello",
          userId,
          role: settings.role,
          nickname: settings.nickname,
          currentTask: settings.currentTask,
        })
      );
    });

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [settings]);

  /**
   * updateProfile
   * Tells the server to update ephemeral profile info for this connection
   */
  function updateProfile(name: string, task: string, role: string) {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "update_profile", name, task, role }));
  }

  /**
   * sendChat
   * Simple chat message to broadcast
   */
  function sendChat(text: string) {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "chat", text }));
  }

  /**
   * setScore
   * Sends a "set_score" message to the server
   */
  function setScore(newScore: number) {
    if (!socket) return;
    const msg = {
      type: "set_score",
      score: newScore,
    };
    socket.send(JSON.stringify(msg));
  }

  /**
   * getDebugState
   * Requests debug state information from the server
   * The response will come as a message with type="debug_state"
   */
  function getDebugState() {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "get_debug_state" }));
  }

  /**
   * clearMessages
   * Requests the server to clear all chat messages
   */
  function clearMessages() {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "clear_messages" }));
  }

  /**
   * clearLeaderboard
   * Requests the server to clear the leaderboard/scoreboard
   */
  function clearLeaderboard() {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "clear_leaderboard" }));
  }

  return {
    socket,
    updateProfile,
    sendChat,
    setScore,
    getDebugState,
    clearMessages,
    clearLeaderboard,
  };
}
