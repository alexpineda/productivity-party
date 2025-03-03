/*
<ai_context>
The main onboarding page that introduces users to the app and guides them through key features.
</ai_context>
<recent_changes>
Added username generation functionality to ensure users have a nickname configured as soon as they arrive.
</recent_changes>
*/

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  User,
  Trophy,
  MessageCircle,
  ChartLine,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { usePipeSettings } from "@/hooks/use-pipe-settings";
import { usePartyKitClient } from "@/lib/party-kit/party-kit-client";
import { PipeSettings } from "@/lib/types/settings-types";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Generates a unique username for new users
 * @returns A randomly generated username
 */
function generateUniqueUsername(): string {
  const adjectives = [
    "Happy",
    "Clever",
    "Bright",
    "Swift",
    "Calm",
    "Bold",
    "Eager",
    "Wise",
    "Brave",
    "Kind",
    "Quick",
    "Smart",
    "Agile",
    "Keen",
    "Witty",
    "Sharp",
    "Lively",
    "Nimble",
    "Deft",
    "Adept",
  ];

  const nouns = [
    "Coder",
    "Hacker",
    "Builder",
    "Maker",
    "Creator",
    "Genius",
    "Wizard",
    "Ninja",
    "Guru",
    "Expert",
    "Master",
    "Crafter",
    "Architect",
    "Engineer",
    "Developer",
    "Designer",
    "Innovator",
    "Pioneer",
    "Visionary",
    "Strategist",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);

  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

export default function OnboardingPage() {
  const { settings, updateSettings, loading } = usePipeSettings();
  const { updateProfile } = usePartyKitClient();

  // Check if user has a nickname and generate one if needed
  useEffect(() => {
    if (!loading && settings) {
      const pipeSettings = settings as PipeSettings;
      const storedNickname = pipeSettings.nickname || "";
      const storedTask = pipeSettings.currentTask || "";
      const storedRole = pipeSettings.role || "";

      // If no nickname exists, generate one and save it
      if (!storedNickname) {
        const generatedNickname = generateUniqueUsername();

        // Update settings with the generated nickname
        updateSettings({
          ...settings,
          nickname: generatedNickname,
        }).then((success) => {
          if (success) {
            // Update party server with the new profile info
            updateProfile(generatedNickname, storedTask, storedRole);
          }
        });
      }
    }
  }, [loading, settings, updateSettings, updateProfile]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Productivity Party! 🎉
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Track your productivity, compete with others, and stay motivated in a
          fun, social environment.
        </p>
      </div>

      {/* API Requirement Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800">Important Note</h3>
          <p className="text-sm text-amber-700">
            This application only works with the OpenAI API. Please ensure you
            have a valid OpenAI API key (or ScreenPipe credits) configured in
            your settings.
          </p>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="grid grid-cols-1 gap-6">
        {/* Step 1: Update Profile */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Step 1: Set Up Your Profile
            </CardTitle>
            <CardDescription>
              Start by personalizing your profile so others can recognize you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Add your nickname, role, and what you&apos;re currently working
                on. This helps others understand your goals and productivity
                context.
              </p>
              <Link href="/profile">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Update Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Explore Productivity */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine className="h-5 w-5 text-blue-500" />
              Step 2: Check Your Productivity
            </CardTitle>
            <CardDescription>
              Understand how your productivity is tracked and measured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Visit the productivity page to see how we measure your focus
                time and calculate your score. Don&apos;t worry - all screen
                data stays local!
              </p>
              <Link href="/productivity">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  View Productivity <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Check Leaderboard */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              Step 3: Visit the Leaderboard
            </CardTitle>
            <CardDescription>
              See how you rank against other productive people.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                The leaderboard shows real-time rankings. As you work
                productively, your score increases and you climb the ranks!
              </p>
              <Link href="/leaderboard">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  View Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Join the Chat */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              Step 4: Join the Community
            </CardTitle>
            <CardDescription>
              Connect with others and share your productivity journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Jump into our chat room to meet other productive people, share
                tips, or just take a quick break!
              </p>
              <Link href="/chat">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Open Chat <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
