/*
<ai_context>
A debug component that displays user state information from the PartyKit server.
</ai_context>
<recent_changes>
Created a new component for debugging user state in the PartyKit server.
</recent_changes>
*/

"use client";

import { useState, useEffect } from "react";
import { usePartyKitClient } from "@/lib/party-kit/party-kit-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pipe } from "@screenpipe/browser";

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

export function DebugState() {
  const [userId, setUserId] = useState<string>("");
  const [debugState, setDebugState] = useState<DebugStateMessage | null>(null);
  const [loading, setLoading] = useState(false);

  // Get user ID from settings
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // Try to get user ID from localStorage first
        const storedUserId = localStorage.getItem("screenpipe-user-id");
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          // Generate a random ID if none exists
          const newUserId = `user-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          localStorage.setItem("screenpipe-user-id", newUserId);
          setUserId(newUserId);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
        // Fallback to random ID
        setUserId(`user-${Math.random().toString(36).substring(2, 9)}`);
      }
    };

    fetchUserId();
  }, []);

  const { socket, getDebugState } = usePartyKitClient(userId);

  // Listen for debug state messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "debug_state") {
          setDebugState(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const handleRequestDebugState = () => {
    setLoading(true);
    getDebugState();

    // Set a timeout to clear loading state if no response
    setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">PartyKit Debug State</h2>
        <Button onClick={handleRequestDebugState} disabled={!socket || loading}>
          {loading ? "Loading..." : "Request Debug State"}
        </Button>
      </div>

      {debugState ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your State</CardTitle>
              <CardDescription>
                Your current connection state on the server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">User ID:</div>
                <div>{debugState.userState.userId}</div>

                <div className="font-semibold">Username:</div>
                <div>{debugState.userState.username}</div>

                <div className="font-semibold">Score:</div>
                <div>{debugState.userState.score}</div>

                <div className="font-semibold">Task:</div>
                <div>{debugState.userState.task}</div>

                <div className="font-semibold">Warning Count:</div>
                <div>{debugState.userState.warningCount}</div>

                <div className="font-semibold">Shadow Banned:</div>
                <div>
                  {debugState.userState.shadowBanned ? (
                    <Badge variant="destructive">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                All Connected Users ({debugState.allUsers.length})
              </CardTitle>
              <CardDescription>
                All users currently connected to the chat room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {debugState.allUsers.map((user) => (
                  <Card
                    key={user.id}
                    className={
                      user.id === debugState.requesterId
                        ? "border-2 border-primary"
                        : ""
                    }
                  >
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm flex justify-between">
                        <span>{user.state.username}</span>
                        {user.id === debugState.requesterId && (
                          <Badge>You</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <div className="font-semibold">ID:</div>
                        <div className="truncate">{user.id}</div>

                        <div className="font-semibold">Score:</div>
                        <div>{user.state.score}</div>

                        <div className="font-semibold">Task:</div>
                        <div>{user.state.task}</div>

                        <div className="font-semibold">Warnings:</div>
                        <div>{user.state.warningCount}</div>

                        <div className="font-semibold">Shadow Banned:</div>
                        <div>
                          {user.state.shadowBanned ? (
                            <Badge variant="destructive" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              No
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(debugState.timestamp).toLocaleString()}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              {loading
                ? "Requesting debug state..."
                : "Click the button to request debug state information"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
