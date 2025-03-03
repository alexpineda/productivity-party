/**
 * @file page.tsx
 * @description
 * This page displays a global leaderboard by connecting to the same PartyKit server
 * as our chat. We receive "scoreboard" messages in real-time and render them in a table.
 *
 * Key features:
 * - "use client" so we can connect to Partykit and handle WebSocket messages
 * - Maintains local state: scoreboard (array), userScore
 * - The user can set their own score by calling setScore() from the party-kit client
 * - Renders the scoreboard in descending order (the server already sorted it)
 *
 * @notes
 * - In a real scenario, each user would have a stable user ID and set their score
 *   from a consistent UI. For demonstration, this page has a "score" input for each user.
 * - Ties are already broken by username on the server side, so we simply display the order returned.
 */

"use client";

import React, { useEffect, useState } from "react";
import { usePartyKitClient } from "@/lib/party-kit/party-kit-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { usePipeSettings } from "@/hooks/use-pipe-settings";
// Basic scoreboard entry shape
interface ScoreboardEntry {
  userId: string;
  username: string;
  score: number;
}

export default function LeaderboardPage() {
  const { settings } = usePipeSettings();

  // local scoreboard
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  // local user score input
  const [userScore, setUserScore] = useState<number>(0);
  // Current user ID (would normally come from auth)
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // We use a custom hook that returns the PartySocket instance or something similar
  const { socket, setScore } = usePartyKitClient();

  // TODO: load user score from server

  // Listen for user ID from messages
  useEffect(() => {
    if (!settings) return;
    if (!settings.screenpipeAppSettings?.user?.id)
      throw new Error("No user ID found");
    setCurrentUserId(settings.screenpipeAppSettings?.user?.id || "");
  }, [settings]);

  // Listen for scoreboard messages from the server
  useEffect(() => {
    if (!socket) return;

    function handleMessage(event: MessageEvent) {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "scoreboard") {
          setScoreboard(msg.scoreboard || []);
        }
      } catch (err) {
        // ignore parse errors
      }
    }

    socket.addEventListener("message", handleMessage);

    // cleanup
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  // Get user's current rank
  const userRank =
    scoreboard.findIndex((entry) => entry.userId === currentUserId) + 1;

  // Render medal for top 3 positions
  const renderRankIndicator = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="font-mono text-sm px-2">{rank}</span>;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Global Leaderboard
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Compete with others and climb the ranks! Update your score to see
          where you stand.
        </p>
      </div>

      <Card className="mb-8 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-500" />
            Rankings
          </CardTitle>
          <CardDescription>
            {scoreboard.length === 0
              ? "No scores yet. Be the first to join the leaderboard!"
              : `Showing ${scoreboard.length} ${
                  scoreboard.length === 1 ? "player" : "players"
                }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRank > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Your Current Rank
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    #{userRank} {userRank <= 3 && "🏆"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Your Score
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {scoreboard
                      .find((entry) => entry.userId === currentUserId)
                      ?.score.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
          {scoreboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No one has a score yet. Be the first!</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-sm">
                      Rank
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-sm">
                      Nickname
                    </th>
                    <th className="py-3 px-4 text-right font-medium text-sm">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scoreboard.map((entry, index) => {
                    const isCurrentUser = entry.userId === currentUserId;
                    return (
                      <tr
                        key={entry.userId}
                        className={`border-b last:border-0 transition-colors ${
                          isCurrentUser
                            ? "bg-blue-50 dark:bg-blue-950/30"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center">
                          {renderRankIndicator(index + 1)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={isCurrentUser ? "font-medium" : ""}
                            >
                              {entry.username || "Anonymous"}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-500">
                                  (You)
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">
                          {entry.score.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
