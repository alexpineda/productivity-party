/*
<ai_context>
Debug page that displays user settings for troubleshooting.
</ai_context>
<recent_changes>
Created a new debug page that displays all user settings in a formatted JSON view.
Fixed import path for the settings-display component.
Added a new PartyKit tab to display real-time connection state information.
</recent_changes>
*/

import { Suspense } from "react";
import { getScreenpipeAppSettings } from "@/lib/actions/get-screenpipe-app-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Client component for displaying settings
import SettingsDisplay from "./_components/settings-display";
import { DebugState } from "@/components/debug/debug-state";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DebugPage() {
  const settings = await getScreenpipeAppSettings();

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Settings</h1>
      <p className="text-muted-foreground">
        This page displays all current user settings for debugging purposes.
      </p>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Settings</TabsTrigger>
          <TabsTrigger value="custom">Custom Settings</TabsTrigger>
          <TabsTrigger value="user">User Info</TabsTrigger>
          <TabsTrigger value="partykit">PartyKit</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Settings</CardTitle>
              <CardDescription>
                Complete settings object from Screenpipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading settings...</div>}>
                <SettingsDisplay settings={settings} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Settings</CardTitle>
              <CardDescription>Plugin-specific custom settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading custom settings...</div>}>
                <SettingsDisplay settings={settings.customSettings || {}} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>User account details</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading user info...</div>}>
                <SettingsDisplay settings={settings.user || {}} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partykit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>PartyKit Debug</CardTitle>
              <CardDescription>
                Real-time connection state information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading PartyKit debug info...</div>}>
                <DebugState />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
