/**
 * @file page.tsx
 * @description
 * This file implements the user profile settings page, where the user
 * can edit their "nickname", "role", and "current task." It utilizes our existing
 * hook `usePipeSettings` to persist these values in `pipe.settings`.
 *
 * @notes
 * - The Next.js App Router organizes this page under the "(app)/profile"
 *   route segment, so users visit "/profile" to edit their info.
 * - Because it uses `usePipeSettings` (a React hook), we mark this
 *   component with 'use client' so it can run in the browser.
 * - For demonstration, we store "nickname", "role", and "currentTask" in the
 *   plugin's custom settings object (under `pipe` namespace).
 *
 * Key features:
 * - Displays form fields: Nickname, Role, Current Task.
 * - Loads existing values from user settings if present.
 * - Offers a "Save Settings" button to update the plugin settings.
 * - Provides inline error or success messaging (optional).
 *
 * @dependencies
 * - React, Next.js (client components).
 * - `usePipeSettings` from "@/hooks/use-pipe-settings" for loading/saving.
 * - `usePartyKitClient` from "@/lib/party-kit/party-kit-client" for updating party server state.
 * - UI components from Shadcn (like Input, Button).
 *
 * @edge-cases
 * - No existing nickname, role, or currentTask in settings => defaults to "".
 * - Save operation fails => we could show an error in the console (or on UI).
 */

"use client";

import { useState, useEffect, FormEvent } from "react";
import { usePipeSettings } from "@/hooks/use-pipe-settings";
import { usePartyKitClient } from "@/lib/party-kit/party-kit-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { User, Briefcase, Save, CheckCircle, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PipeSettings } from "@/lib/types/settings-types";

/**
 * ProfilePage
 * @description The default export for this route. Renders a simple UI allowing
 * the user to set a nickname, role, and currentTask, then saves them in plugin settings.
 */
export default function ProfilePage() {
  // Load from the custom "pipe" settings object, if present
  const { settings, updateSettings, loading } = usePipeSettings();
  const { updateProfile } = usePartyKitClient();
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // On first load, set local form states from the stored settings
  useEffect(() => {
    if (!loading && settings) {
      // If we previously stored the nickname/role in the pipe object
      const pipeSettings = settings as PipeSettings;
      const storedNickname = pipeSettings.nickname || "";
      const storedRole = pipeSettings.role || "";

      setNickname(storedNickname);
      setRole(storedRole);
    }
  }, [loading, settings]);

  /**
   * onSave
   * @description Handles form submission to save user settings.
   * @param e The standard form event
   */
  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setShowSuccess(false);

    try {
      // Update both local settings and party server state
      const updated: Partial<PipeSettings> = {
        ...settings,
        nickname,
        role,
      };

      const success = await updateSettings(updated);
      if (success) {
        // Also update the party server state
        // Get current task from settings since we no longer track it on this page
        const pipeSettings = settings as PipeSettings;
        updateProfile(nickname, pipeSettings.currentTask || "", role);

        setMessage("Profile updated successfully!");
        setShowSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setMessage("");
        }, 3000);
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error saving user profile:", err);
      setMessage("An error occurred while saving your profile.");
    } finally {
      setSaving(false);
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          User Profile
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Customize your profile settings and let others know what you&apos;re
          working on.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Your Profile
            </CardTitle>
            <CardDescription>
              How others will see you in the chat and leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32 bg-gradient-to-r from-blue-600 to-purple-600">
              <AvatarFallback className="text-2xl">
                {getInitials(nickname)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-medium">{nickname || "Anonymous"}</h3>
              <p className="text-sm text-gray-500">{role || "No role set"}</p>
              <p className="text-xs text-gray-400 mt-1">
                {settings && (settings as PipeSettings).currentTask
                  ? (settings as PipeSettings).currentTask
                  : "No current task set"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Edit Profile
            </CardTitle>
            <CardDescription>
              Update your profile information and current task
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSave}>
            <CardContent className="space-y-4">
              {/* Nickname */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nickname
                </label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  className="w-full"
                  required
                />
                <p className="text-xs text-gray-500">
                  This will be displayed in chat messages and on the leaderboard
                </p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. UX Designer, Full Stack Developer"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Your professional role or title
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
                    Save Settings
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
