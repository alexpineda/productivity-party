/**
 * This partykit server runs on a edge worker (workerd)
 * We use a different set of api keys since we're not using the client side settings.
 */

import type * as Party from "partykit/server";
import { moderateMessage } from "@/app/actions/moderation";
import { createServiceClient } from "./supabase-service-client";
import { TTLKeyedCache } from "./utils/ttl-cache";

// Basic chat message structure
interface ChatMessageStorage {
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
  userConnectionId: string;
  allUsers: {
    id: string;
    state: ConnectionState;
    connectionId: string;
  }[];
  timestamp: number;
}

// The ephemeral user state in this server
interface ConnectionState {
  userId: string;
  username: string;
  task: string;
  role: string;
  warningCount: number; // how many flagged messages
  hasSetValidUserId: boolean; // flag to track if a valid userId has been set via hello message
}

// Scoreboard entry in Supabase
interface ScoreboardEntry {
  user_id: string;
  user_name: string;
  score: number;
  month: string;
  region: string;
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
  private bannedChatCache: TTLKeyedCache<boolean>;
  private scoreUpdateQueue: Map<
    string,
    { username: string; score: number; timestamp: number }
  >;
  private scoreUpdateTimer: NodeJS.Timeout | null = null;
  private readonly SCORE_UPDATE_INTERVAL = 5000;
  private messageRateLimits: Map<string, number[]>; // User ID -> timestamps of recent messages
  private readonly MAX_MESSAGES_PER_MINUTE = 20;
  private readonly RATE_LIMIT_WINDOW_MS = 60000;
  private isShuttingDown = false;
  private scoreboardCache: ScoreboardEntry[] | null = null;
  private scoreboardCacheExpiry: number = 0;
  private readonly SCOREBOARD_CACHE_TTL = 60000; // 1 minute cache TTL
  private readonly BANNED_CHAT_CACHE_TTL = 60000; // 1 minute cache TTL

  constructor(public room: Party.Room) {
    this.bannedChatCache = new TTLKeyedCache<boolean>(
      this.BANNED_CHAT_CACHE_TTL
    );

    // Init score update batch queue
    this.scoreUpdateQueue = new Map();

    // Init message rate limiter
    this.messageRateLimits = new Map();

    // No process.on here - Cloudflare Workers don't have a Node.js process object
  }

  /**
   * Cleanup resources before server shutdown
   */
  private async cleanup() {
    // Prevent new messages during shutdown
    this.isShuttingDown = true;

    // Process any pending score updates
    if (this.scoreUpdateQueue.size > 0 && this.scoreUpdateTimer) {
      clearTimeout(this.scoreUpdateTimer);
      await this.processBatchScoreUpdates();
    }

    // Notify clients if needed
    const shutdownMsg: ChatMessageStorage = {
      type: "chat",
      from: "System",
      text: "Server is shutting down for maintenance. Please reconnect in a few minutes.",
      timestamp: Date.now(),
    };
    this.room.broadcast(JSON.stringify(shutdownMsg));
  }

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
      task: "",
      role: "",
      warningCount: 0,
      userId: connection.id,
      hasSetValidUserId: false,
    });

    // Retrieve existing messages from ephemeral storage
    const messages =
      (await this.room.storage.get<ChatMessageStorage[]>("messages")) ?? [];

    // Send them to the newly connected user
    for (const msg of messages) {
      connection.send(JSON.stringify(msg));
    }

    // Send current scoreboard to new connection
    await this.broadcastScoreboardToConnection(connection);
  }

  /**
   * onDisconnect
   * Called when a user disconnects from the PartyKit room.
   * We'll send a system message to notify others and clean up any resources.
   */
  async onDisconnect(connection: Party.Connection<ConnectionState>) {
    // Get the disconnected user's state
    const state = connection.state;
    if (!state || !state.hasSetValidUserId) return;

    // Optional: Notify other users that someone left
    const systemMsg: ChatMessageStorage = {
      type: "chat",
      from: "System",
      text: `${state.username} has left the chat.`,
      timestamp: Date.now(),
    };

    // Get existing messages
    const messages =
      (await this.room.storage.get<ChatMessageStorage[]>("messages")) ?? [];

    // Add system message about user leaving
    messages.unshift(systemMsg);

    // Prune if needed
    if (messages.length > MAX_MESSAGES) {
      messages.length = MAX_MESSAGES;
    }

    // Save and broadcast
    await this.room.storage.put("messages", messages);
    this.room.broadcast(JSON.stringify(systemMsg));

    // Force process any pending score updates for this user before they disconnect
    if (this.scoreUpdateQueue.has(state.userId)) {
      await this.processBatchScoreUpdates();
    }
  }

  /**
   * Helper method to check if a connection has a valid userId set via hello message
   */
  private hasValidUserId(
    connection: Party.Connection<ConnectionState>
  ): boolean {
    return connection.state?.hasSetValidUserId === true;
  }

  private getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7); // Returns YYYY-MM format
  }

  private async getServiceClient(): Promise<
    ReturnType<typeof createServiceClient>
  > {
    return createServiceClient(this.room);
  }

  private async getScoreboard(): Promise<ScoreboardEntry[]> {
    const now = Date.now();

    // Return cached result if valid
    if (this.scoreboardCache && now < this.scoreboardCacheExpiry) {
      return this.scoreboardCache;
    }

    // Otherwise fetch from database
    const db = await this.getServiceClient();
    const month = this.getCurrentMonth();

    const { data } = await db
      .from("scoreboard")
      .select("user_id, user_name, score, month, region")
      .eq("month", month)
      .order("score", { ascending: false });

    if (!data) {
      return [];
    }

    // Map to the correct types
    const typedData: ScoreboardEntry[] = data.map((item) => ({
      user_id: item.user_id,
      user_name: item.user_name,
      score: item.score,
      month: item.month,
      region: item.region || "global",
    }));

    // Update cache
    this.scoreboardCache = typedData;
    this.scoreboardCacheExpiry = now + this.SCOREBOARD_CACHE_TTL;

    return typedData;
  }

  private async updateScore(userId: string, username: string, delta: number) {
    // Get the current scoreboard row
    const db = await this.getServiceClient();
    const month = this.getCurrentMonth();

    // fetch existing entry
    const { data: existing } = await db
      .from("scoreboard")
      .select("*")
      .eq("user_id", userId)
      .eq("month", month)
      .single();

    const oldScore = existing?.score ?? 0;
    // Ensure score never goes below 0
    const newScore = Math.max(0, oldScore + delta);

    // Queue the score update
    this.scoreUpdateQueue.set(userId, {
      username,
      score: newScore,
      timestamp: Date.now(),
    });

    // Start the timer if not already running
    if (!this.scoreUpdateTimer) {
      this.scoreUpdateTimer = setTimeout(
        () => this.processBatchScoreUpdates(),
        this.SCORE_UPDATE_INTERVAL
      );
    }

    return true;
  }

  private async processBatchScoreUpdates() {
    // Clear the timer
    this.scoreUpdateTimer = null;

    // If queue is empty, do nothing
    if (this.scoreUpdateQueue.size === 0) return;

    const db = await this.getServiceClient();
    const month = this.getCurrentMonth();
    const updates = Array.from(this.scoreUpdateQueue.entries());

    // Clear the queue
    this.scoreUpdateQueue.clear();

    // Invalidate scoreboard cache since we're updating scores
    this.scoreboardCache = null;
    this.scoreboardCacheExpiry = 0;

    // First filter out banned users
    const userIds = updates.map(([userId]) => userId);
    const { data: bannedUsers } = await db
      .from("banned")
      .select("user_id, banned_score_reason")
      .in("user_id", userIds);

    const bannedUserIds = new Set(bannedUsers?.map((u) => u.user_id) || []);

    // Prepare upsert data for non-banned users
    const upsertData = updates
      .filter(([userId]) => !bannedUserIds.has(userId))
      .map(([userId, data]) => ({
        user_id: userId,
        user_name: data.username,
        score: data.score,
        month,
        region: "global",
      }));

    if (upsertData.length === 0) return;

    console.log("Upserting data:", upsertData);
    // Perform the batch upsert
    const { error } = await db.from("scoreboard").upsert(upsertData, {
      onConflict: "user_id,month",
    });

    if (error) {
      console.error("Error batch updating scores:", error);
    }

    // Broadcast updated scoreboard
    await this.broadcastScoreboard();
  }

  private async isUserBanned(userId: string): Promise<boolean> {
    // Check cache first
    const cachedBanned = this.bannedChatCache.get(userId);
    if (cachedBanned !== null) {
      return cachedBanned;
    }

    // Cache miss - check database
    const db = await this.getServiceClient();
    const { data } = await db
      .from("banned")
      .select("banned_chat_reason")
      .eq("user_id", userId)
      .single();

    const isBanned = !!data?.banned_chat_reason;
    // Update cache
    this.bannedChatCache.set(userId, isBanned);

    return isBanned;
  }

  /**
   * Check if a user is rate limited
   * @param userId The user's ID
   * @returns true if rate limited, false otherwise
   */
  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    const userMessages = this.messageRateLimits.get(userId) || [];

    // Filter out messages older than our window
    const recentMessages = userMessages.filter(
      (timestamp) => now - timestamp < this.RATE_LIMIT_WINDOW_MS
    );

    // Update the stored timestamps
    this.messageRateLimits.set(userId, recentMessages);

    // Check if they've sent too many messages
    return recentMessages.length >= this.MAX_MESSAGES_PER_MINUTE;
  }

  /**
   * Record a message from a user for rate limiting
   * @param userId The user's ID
   */
  private recordMessage(userId: string): void {
    const userMessages = this.messageRateLimits.get(userId) || [];
    userMessages.push(Date.now());
    this.messageRateLimits.set(userId, userMessages);
  }

  async onMessage(raw: string, sender: Party.Connection<ConnectionState>) {
    // If server is shutting down, reject all messages
    if (this.isShuttingDown) {
      sender.send(
        JSON.stringify({
          type: "error",
          message:
            "Server is shutting down. Please reconnect in a few minutes.",
          timestamp: Date.now(),
        })
      );
      return;
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      // Not valid JSON, just ignore
      return;
    }

    // Special case: always allow "hello" messages to set the userId
    if (data.type === "hello") {
      if (data.userId) {
        const currentState = sender.state || {
          username: data.nickname || "Anonymous",
          task: data.currentTask || "",
          role: data.role || "",
          warningCount: 0,
          userId: data.userId,
          hasSetValidUserId: true,
        };

        sender.setState({
          ...currentState,
          userId: data.userId,
          username: data.nickname || currentState.username,
          task: data.currentTask || currentState.task,
          role: data.role || currentState.role,
          hasSetValidUserId: true,
        });
      }
      return; // Exit after processing hello message
    }

    // For all other message types, bail out if no valid userId has been set
    if (!this.hasValidUserId(sender)) {
      // Optionally send an error message back to the client
      const errorMsg = {
        type: "error",
        message:
          "No valid userId set. Please send a 'hello' message with userId first.",
        timestamp: Date.now(),
      };
      sender.send(JSON.stringify(errorMsg));
      return;
    }

    // Process other message types only if a valid userId has been set
    switch (data.type) {
      case "update_profile": {
        // Update user profile (name, task, role)
        const currentState = sender.state!;
        sender.setState({
          ...currentState,
          username: data.name || currentState.username,
          task: data.task || currentState.task,
          role: data.role || currentState.role,
        });

        // If they have a score, update their username there too
        if (data.name) {
          const db = await this.getServiceClient();
          await db
            .from("scoreboard")
            .update({ user_name: data.name })
            .eq("user_id", currentState.userId)
            .eq("month", this.getCurrentMonth());
        }

        await this.broadcastScoreboard();
        break;
      }

      case "chat": {
        /**
         * Example shape:
         * { type: "chat", text: "Hello, world!" }
         *
         * We'll transform this to store sender's username, then
         * store and broadcast.
         */

        // First check if user is banned
        const currentState = sender.state!;
        const { username, warningCount } = currentState;
        const text = data.text || "";

        const isBanned = await this.isUserBanned(currentState.userId);
        if (isBanned) {
          sender.send(
            JSON.stringify({
              type: "error",
              message: "You are banned from chat",
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Check for rate limiting
        if (this.isRateLimited(currentState.userId)) {
          sender.send(
            JSON.stringify({
              type: "error",
              message:
                "You are sending messages too quickly. Please wait a moment.",
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Record this message for rate limiting
        this.recordMessage(currentState.userId);

        // Create the new ChatMessage
        const newMessage: ChatMessageStorage = {
          type: "chat",
          from: username,
          text,
          timestamp: Date.now(),
        };

        // Otherwise we do moderation
        const flagged = await moderateMessage(text);
        if (flagged) {
          const newCount = warningCount + 1;
          sender.setState({
            ...currentState,
            warningCount: newCount,
          });

          // Check if they exceed threshold => ban them
          if (newCount >= MAX_WARNINGS) {
            // Record the ban in Supabase
            const db = await this.getServiceClient();
            await db.from("banned").upsert({
              user_id: currentState.userId,
              banned_chat_reason: "Exceeded maximum warnings",
            });
            // Update the cache
            this.bannedChatCache.set(currentState.userId, true);
          }
          return;
        }

        // If not flagged => store + broadcast
        const messages =
          (await this.room.storage.get<ChatMessageStorage[]>("messages")) ?? [];
        messages.unshift(newMessage);
        // Only keep the most recent MAX_MESSAGES
        if (messages.length > MAX_MESSAGES) {
          messages.length = MAX_MESSAGES;
        }
        await this.room.storage.put("messages", messages);

        // broadcast to everyone (except the original sender? up to you).
        // We'll broadcast to everyone for normal chat:
        this.room.broadcast(JSON.stringify(newMessage));
        break;
      }

      case "update_score": {
        /**
         * Example shape:
         * { type: "update_score", delta: <number> }
         */
        // Always use the userId from the state (set via hello message)
        const currentState = sender.state!;
        const userId = currentState.userId; // Use the userId from state, not from the message
        const delta = typeof data.delta === "number" ? data.delta : 0;

        await this.updateScore(userId, currentState.username, delta);
        // No need to broadcast here - the batched update will do it
        break;
      }
    }

    // Check for debug key but without using process.env which isn't available in Cloudflare Workers
    const debugKey = this.room.env?.PARTYKIT_DEBUG_KEY;
    if (data.debugKey !== debugKey) {
      console.log("UNAUTHORIZED DEBUG REQUEST");
      return;
    }

    switch (data.type) {
      case "get_debug_state": {
        /**
         * Example shape:
         * { type: "get_debug_state" }
         *
         * Returns the user's current state and all connected users' states
         */
        const currentState = sender.state!;

        // Get all connected users
        const connections = Array.from(
          this.room.getConnections<ConnectionState>()
        );
        const allUsers = connections.map((conn) => ({
          id: conn.id, // Connection ID
          state: (conn.state as ConnectionState) || {
            username: "Unknown",
            task: "none",
            role: "",
            warningCount: 0,
            userId: conn.state?.userId || "",
            hasSetValidUserId: false,
          },
          connectionId: conn.id, // Explicitly include connection ID
        }));

        // Create debug state message
        const debugStateMsg: DebugStateMessage = {
          type: "debug_state",
          requesterId: sender.id,
          userState: currentState,
          userConnectionId: sender.id, // Include the connection ID for the requesting user
          allUsers,
          timestamp: Date.now(),
        };

        // Send only to the requesting user
        sender.send(JSON.stringify(debugStateMsg));
        break;
      }

      case "clear_messages": {
        /**
         * Example shape:
         * { type: "clear_messages" }
         *
         * Clears all chat messages from storage
         */
        await this.room.storage.put("messages", []);

        // Notify all users that messages have been cleared
        const systemMsg: ChatMessageStorage = {
          type: "chat",
          from: "System",
          text: "All messages have been cleared by an administrator.",
          timestamp: Date.now(),
        };
        this.room.broadcast(JSON.stringify(systemMsg));
        break;
      }

      case "clear_leaderboard": {
        /**
         * Example shape:
         * { type: "clear_leaderboard" }
         *
         * Clears the leaderboard/scoreboard
         */
        const db = await this.getServiceClient();
        await db
          .from("scoreboard")
          .delete()
          .eq("month", this.getCurrentMonth());

        // Broadcast empty scoreboard to all
        await this.broadcastScoreboard();

        // Notify all users that the leaderboard has been cleared
        const systemMsg: ChatMessageStorage = {
          type: "chat",
          from: "System",
          text: "The leaderboard has been cleared by an administrator.",
          timestamp: Date.now(),
        };
        this.room.broadcast(JSON.stringify(systemMsg));
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
    const scoreboard = await this.getScoreboard();
    // Transform property names to match client expectations
    const clientScoreboard = scoreboard.map((entry) => ({
      userId: entry.user_id,
      username: entry.user_name,
      score: entry.score,
      month: entry.month,
      region: entry.region,
    }));
    const msg = {
      type: "scoreboard",
      scoreboard: clientScoreboard,
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
    const scoreboard = await this.getScoreboard();
    // Transform property names to match client expectations
    const clientScoreboard = scoreboard.map((entry) => ({
      userId: entry.user_id,
      username: entry.user_name,
      score: entry.score,
      month: entry.month,
      region: entry.region,
    }));
    const msg = {
      type: "scoreboard",
      scoreboard: clientScoreboard,
    };
    connection.send(JSON.stringify(msg));
  }

  /**
   * onRequest
   * Handles HTTP requests to the PartyKit server.
   * This allows server-to-server communication without a WebSocket connection.
   *
   * Currently supports:
   * - POST with { type: "update_score", userId: string, delta: number }
   * - GET with { type: "get_user_score", userId: string }
   * - GET /health for health check status
   */
  async onRequest(req: Party.Request): Promise<Response> {
    // Handle health check endpoint
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/party/health") {
      const connections = Array.from(this.room.getConnections()).length;

      // Check database connection
      let dbStatus = { status: "unknown", error: null as string | null };
      try {
        const db = await this.getServiceClient();
        // Simple query to check if the database is accessible
        const { data, error } = await db
          .from("scoreboard")
          .select("user_id, user_name, score, month, region")
          .eq("month", this.getCurrentMonth())
          .order("score", { ascending: false });
        if (error) {
          dbStatus = { status: "error", error: error.message };
        } else {
          dbStatus = { status: "connected", error: null };
        }
      } catch (err) {
        dbStatus = {
          status: "error",
          error: err instanceof Error ? err.message : "Unknown database error",
        };
      }

      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: Date.now(),
          connections,
          database: dbStatus,
          memory: {
            scoreboardCacheSize: this.scoreboardCache?.length || 0,
            messagesQueueSize: this.scoreUpdateQueue.size,
            rateLimitersCount: this.messageRateLimits.size,
          },
          env_node: {
            ...process.env,
            DEV: process.env.NODE_ENV === "development",
            PROD: process.env.NODE_ENV === "production",
          },
          env_partykit: {
            ...this.room.env,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
    }

    // Handle GET requests for scores
    if (req.method === "GET") {
      const type = url.searchParams.get("type");
      const userId = url.searchParams.get("userId");

      if (type === "get_user_score" && userId) {
        const db = await this.getServiceClient();
        const month = this.getCurrentMonth();

        const { data } = await db
          .from("scoreboard")
          .select("score")
          .eq("user_id", userId)
          .eq("month", month)
          .single();

        return new Response(
          JSON.stringify({
            success: true,
            score: data?.score || 0,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );
      }

      return new Response("Invalid request", { status: 400 });
    }

    // Handle POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      // Parse the request body
      const data = (await req.json()) as {
        type: string;
        userId?: string;
        delta?: number;
      };

      // Handle different request types
      switch (data.type) {
        case "update_score": {
          if (!data.userId || typeof data.delta !== "number") {
            return new Response("Invalid request: missing userId or delta", {
              status: 400,
            });
          }

          // Get current username from scoreboard
          const db = await this.getServiceClient();
          const { data: userData } = await db
            .from("scoreboard")
            .select("user_name")
            .eq("user_id", data.userId)
            .single();

          const username = userData?.user_name || "Anonymous";

          await this.updateScore(data.userId, username, data.delta);
          // No need to broadcast here - the batched update will do it

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        default:
          return new Response("Unknown request type", { status: 400 });
      }
    } catch (error) {
      console.error("Error handling request:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }
}
