/*
<ai_context>
The main onboarding page that introduces users to the app and guides them through key features.
</ai_context>
<recent_changes>
Fixed linter errors by escaping apostrophes.
</recent_changes>
*/

"use client";

import React from "react";
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
} from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Welcome Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Productivity Party! 🎉
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Track your productivity, compete with others, and stay motivated in a
          fun, social environment.
        </p>
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
