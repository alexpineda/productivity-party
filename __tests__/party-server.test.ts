/**
 * @file party-server.test.ts
 * @description
 * A minimal test suite for the ChatServer from party-server/server.ts. This checks
 * ephemeral scoreboard logic and message handling at a basic level, using mocks.
 *
 * Key features tested:
 * - set_score message updates ephemeral scoreboard in storage
 * - scoreboard broadcast
 *
 * @dependencies
 * - vitest for test runner
 *
 * @notes
 * - Full integration testing would involve an actual Partykit environment.
 *   Here, we do partial mocking of the 'room' and 'connection' to verify logic.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import ChatServer from "@/party-server/server";

describe("ChatServer ephemeral scoreboard logic", () => {
  let mockStorage: any;
  let mockRoom: any;
  let server: ChatServer;
  let mockConnection: any;

  beforeEach(() => {
    // create a fresh mock storage and room each test
    mockStorage = new Map();
    mockRoom = {
      storage: {
        get: vi.fn((key) => {
          return mockStorage.get(key);
        }),
        put: vi.fn((key, value) => {
          mockStorage.set(key, value);
        }),
      },
      broadcast: vi.fn(),
    };

    // create a test instance of ChatServer
    server = new ChatServer(mockRoom as any);

    // create a mock connection with ephemeral state
    mockConnection = {
      id: "user123",
      state: {
        username: "Tester",
        score: 0,
        task: "none",
        warningCount: 0,
        shadowBanned: false,
      },
      setState(updates: any) {
        this.state = { ...this.state, ...updates };
      },
      send: vi.fn(),
    };
  });

  it("should update scoreboard on set_score", async () => {
    const message = JSON.stringify({ type: "set_score", score: 42 });
    await server.onMessage(message, mockConnection as any);

    // scoreboard should be stored in ephemeral memory with user123 => 42
    const scoreboard = mockStorage.get("scoreboard");
    expect(scoreboard).toEqual([
      {
        userId: "user123",
        username: "Tester",
        score: 42,
      },
    ]);

    // broadcast call
    expect(mockRoom.broadcast).toHaveBeenCalledTimes(1);
    expect(mockRoom.broadcast.mock.calls[0][0]).toContain(
      '"type":"scoreboard"'
    );
  });

  it("should keep scoreboard sorted by score descending", async () => {
    // put an existing scoreboard
    mockStorage.set("scoreboard", [
      { userId: "u1", username: "Alpha", score: 50 },
      { userId: "u2", username: "Beta", score: 10 },
    ]);

    // set our user to 999 => should appear at top
    const message = JSON.stringify({ type: "set_score", score: 999 });
    await server.onMessage(message, mockConnection as any);

    const scoreboard = mockStorage.get("scoreboard");
    expect(scoreboard[0].userId).toBe("user123");
    expect(scoreboard[0].score).toBe(999);
    expect(scoreboard[1].userId).toBe("u1");
    expect(scoreboard[2].userId).toBe("u2");
  });
});
