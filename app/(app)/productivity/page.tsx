/**
 * TODO:
 * This page shoul dprovide some insight into their score snd productivity
 * it should also explain how things ar ebeing calculated and tracked
 * Include a privacy explanation (everything stays local just a numeric score goes to network)
 */

"use client";

import { useEffect, useState, FormEvent } from "react";
import { useProductivityTracker } from "@/hooks/use-productivity-tracker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  TrendingUp,
  Clock,
  RefreshCcw,
  AlertCircle,
  Target,
  Save,
  CheckCircle,
} from "lucide-react";
import { usePipeSettings } from "@/hooks/use-pipe-settings";
import { isDevelopment, PRODUCTIVITY_SCORE_UPDATE_INTERVAL } from "@/config";
import { getUserScore } from "@/app/actions/partykit-actions";
import { usePartyKitClient } from "@/lib/party-kit/party-kit-client";
import { PipeSettings } from "@/lib/types/settings-types";

export default function ProductivityPage() {
  const { settings, updateSettings } = usePipeSettings();
  const { updateProfile } = usePartyKitClient();
  const {
    blocks,
    score: localScore,
    loading,
    error,
    refreshProductivityData,
    fetchHistoricalData,
  } = useProductivityTracker();
  const [serverScore, setServerScore] = useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Use server score if available, otherwise fall back to local score
  const displayScore = serverScore !== null ? serverScore : localScore;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!settings) return;

    // Fetch historical data on component mount
    // This only retrieves data for display, doesn't trigger scoring
    fetchHistoricalData();
    // refreshProductivityData();

    // Fetch the user's score from the server
    fetchUserScore();

    // Load current task from settings
    if (settings) {
      const pipeSettings = settings as PipeSettings;
      setCurrentTask(pipeSettings.currentTask || "");
    }

    const timer = setInterval(() => {
      fetchHistoricalData();
      // refreshProductivityData();
      fetchUserScore();
    }, 60_000);

    return () => clearInterval(timer);
  }, [settings]);

  /**
   * onSaveTask
   * @description Handles form submission to save user's current task
   * @param e The standard form event
   */
  async function onSaveTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setShowSuccess(false);

    try {
      // Update both local settings and party server state
      const updated: Partial<PipeSettings> = {
        ...settings,
        currentTask,
      };

      const success = await updateSettings(updated);
      if (success) {
        // Also update the party server state with current profile data
        const pipeSettings = settings as PipeSettings;
        updateProfile(
          pipeSettings.nickname || "",
          currentTask,
          pipeSettings.role || ""
        );

        setMessage("Current task updated successfully!");
        setShowSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setMessage("");
        }, 3000);
      } else {
        setMessage("Failed to update current task.");
      }
    } catch (err) {
      console.error("Error saving current task:", err);
      setMessage("An error occurred while saving your current task.");
    } finally {
      setSaving(false);
    }
  }

  // Function to fetch the user's score from the server
  const fetchUserScore = async () => {
    setIsLoadingScore(true);
    try {
      const score = await getUserScore();
      setServerScore(score);
    } catch (err) {
      console.error("Failed to fetch user score from server:", err);
    } finally {
      setIsLoadingScore(false);
    }
  };

  // Handle manual refresh button click
  const handleRefresh = () => {
    refreshProductivityData();
    fetchUserScore(); // Also refresh the server score
  };

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

      {/* Current Task Card */}
      <Card className="shadow-md transition-all hover:shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Current Task
          </CardTitle>
          <CardDescription>What are you working on right now?</CardDescription>
        </CardHeader>
        <form onSubmit={onSaveTask}>
          <CardContent>
            <div className="space-y-2">
              <Input
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="Enter what you're currently working on..."
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Setting your current task helps contextualize your productivity
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t pt-4">
            <div className="flex-1">
              {showSuccess && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{message}</span>
                </div>
              )}
              {message && !showSuccess && (
                <p className="text-sm text-red-500">{message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg
                    className="animate-pulse -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Task
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

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
                {isLoadingScore ? "Loading..." : displayScore}
              </div>
              <Progress value={Math.min(100, Math.max(0, displayScore))} />
              {isDevelopment && (
                <Button
                  onClick={handleRefresh}
                  disabled={loading || isLoadingScore}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh
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
                blocks.slice(0, 3).map((block, i) => (
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
                          block.classification.classification === "productive"
                            ? "default"
                            : block.classification.classification === "break"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {block.classification.classification}
                      </Badge>
                    </div>
                    {/* Display the short AI summary */}
                    <p className="text-xs text-gray-700 mt-1 italic">
                      {block.classification.shortSummary || "No summary."}
                    </p>
                    <p className="text-xs text-gray-700 mt-1 italic">
                      {block.classification.reason || "No reason."}
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
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold mb-2">Extra notes</h3>
              <p className="text-sm text-gray-600">
                The score is dependent on the ai classifying the blocks.
                Sometimes it may get it wrong, and that&apos;s ok! Blocks are
                processed every {PRODUCTIVITY_SCORE_UPDATE_INTERVAL} minutes, so
                you may not see an immediate change in your score. If you close
                the app, and re-open, only the last 3 blocks will be analyzed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
