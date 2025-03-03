/**
 * TODO:
 * This page shoul dprovide some insight into their score snd productivity
 * it should also explain how things ar ebeing calculated and tracked
 * Include a privacy explanation (everything stays local just a numeric score goes to network)
 */

"use client";

import { useEffect } from "react";
import { useProductivityTracker } from "@/hooks/use-productivity-tracker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  TrendingUp,
  Clock,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { usePipeSettings } from "@/hooks/use-pipe-settings";

export default function ProductivityPage() {
  const { settings } = usePipeSettings();
  const { blocks, score, loading, error, classifyAndScoreAllBlocks } =
    useProductivityTracker();

  useEffect(() => {
    if (!settings) return;

    // Trigger the cron job API endpoint to ensure up-to-date score
    fetch("/api/calcscore")
      .then((response) => response.json())
      .then((data) => {
        console.log("Score updated from cron job:", data);
      })
      .catch((err) => console.error("Error running calcscore:", err));

    // For live UI, load the blocks for display
    classifyAndScoreAllBlocks(
      settings,
      settings.role ?? "I'm a developer",
      false
    );
  }, [settings]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Productivity Dashboard 📈
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Track your focus, understand your patterns, and improve your
          productivity score.
        </p>
      </div>

      {/* Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Current Score
            </CardTitle>
            <CardDescription>Your productivity ranking points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {score}
              </div>
              <Progress value={Math.min(100, Math.max(0, score))} />
              {process.env.NODE_ENV === "development" && (
                <Button
                  onClick={() => {
                    // Only for debug purposes
                    fetch("/api/calcscore")
                      .then((response) => response.json())
                      .then((data) => {
                        console.log("Debug refresh:", data);
                        window.location.reload();
                      });
                  }}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Debug Refresh
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your last few productivity blocks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm mb-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : blocks.length === 0 ? (
                <div className="text-center text-gray-500">
                  No recent activity recorded
                </div>
              ) : (
                blocks.slice(-3).map((block, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-2 rounded-lg bg-gray-50 mb-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(block.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Badge
                        variant={
                          block.classification === "productive"
                            ? "default"
                            : block.classification === "break"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {block.classification}
                      </Badge>
                    </div>
                    {/* Display the short AI summary */}
                    <p className="text-xs text-gray-700 mt-1 italic">
                      {block.aiDescription || "No summary."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="shadow-md transition-all hover:shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            How It Works
          </CardTitle>
          <CardDescription>
            Understanding productivity tracking and privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold mb-2">🎯 Productivity Tracking</h3>
              <p className="text-sm text-gray-600">
                Your activity is broken into 15-minute blocks. Each block is
                classified as either productive (coding, reading docs) or
                unproductive (social media, entertainment) based on your role
                and goals. Breaks are tracked separately and don&apos;t affect
                your score.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold mb-2">🔒 Privacy First</h3>
              <p className="text-sm text-gray-600">
                All screen data and activity details stay on your device. Only
                your numeric score is shared with the leaderboard. We never see
                or store your actual screen content.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold mb-2">⚡ Scoring System</h3>
              <p className="text-sm text-gray-600">
                Your score increases with productive blocks and slightly
                decreases with unproductive ones. Breaks are neutral. The more
                consistent you are with productive work, the higher your score
                will climb!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
