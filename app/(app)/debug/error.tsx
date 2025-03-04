/*
<ai_context>
Debug-specific error page with enhanced debugging capabilities for the debug route.
</ai_context>
<recent_changes>
Fixed the linter error by using a try-catch block to handle Screenpipe settings access.
</recent_changes>
*/

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pipe } from "@screenpipe/browser";

export default function DebugErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string; cause?: any };
  reset: () => void;
}) {
  const [settings, setSettings] = useState<any>(null);
  const [errorTime] = useState<string>(new Date().toISOString());
  const [browserInfo] = useState<any>({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    colorDepth: window.screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    connection: (navigator as any).connection
      ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
        }
      : "Not available",
  });

  useEffect(() => {
    // Log the error to console with additional context
    console.error("Debug route error:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      cause: error.cause,
      time: errorTime,
      browser: browserInfo,
    });

    // Try to get Screenpipe settings
    const fetchSettings = async () => {
      try {
        // Access Screenpipe settings using a try-catch to handle potential errors
        // This is a safer approach than directly accessing pipe.settings
        const response = await fetch("/api/settings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`);
        }

        const pipeSettings = await response.json();
        setSettings(pipeSettings);
      } catch (settingsError) {
        console.error("Failed to fetch Screenpipe settings:", settingsError);
        setSettings({ error: "Failed to load settings" });
      }
    };

    fetchSettings();
  }, [error, errorTime, browserInfo]);

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
          <CardTitle className="text-amber-700 dark:text-amber-300">
            Debug Error
          </CardTitle>
          <CardDescription>
            An error occurred in the debug route. Detailed technical information
            is available below.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Error Message</h3>
            <p className="p-3 mt-1 text-sm bg-gray-100 rounded dark:bg-gray-800 font-mono">
              {error.message || "Unknown error"}
            </p>
          </div>

          <Tabs defaultValue="error-details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="error-details">Error Details</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="screenpipe">Screenpipe</TabsTrigger>
            </TabsList>

            <TabsContent value="error-details" className="mt-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="stack-trace">
                  <AccordionTrigger>Stack Trace</AccordionTrigger>
                  <AccordionContent>
                    <pre className="p-3 overflow-auto text-xs bg-gray-100 rounded dark:bg-gray-800 max-h-[300px]">
                      {error.stack || "No stack trace available"}
                    </pre>
                  </AccordionContent>
                </AccordionItem>

                {error.digest && (
                  <AccordionItem value="error-digest">
                    <AccordionTrigger>Error Digest</AccordionTrigger>
                    <AccordionContent>
                      <p className="p-3 text-sm bg-gray-100 rounded dark:bg-gray-800 font-mono">
                        {error.digest}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {error.cause && (
                  <AccordionItem value="error-cause">
                    <AccordionTrigger>Error Cause</AccordionTrigger>
                    <AccordionContent>
                      <pre className="p-3 overflow-auto text-xs bg-gray-100 rounded dark:bg-gray-800 max-h-[300px]">
                        {typeof error.cause === "object"
                          ? JSON.stringify(error.cause, null, 2)
                          : String(error.cause)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="error-time">
                  <AccordionTrigger>Error Time</AccordionTrigger>
                  <AccordionContent>
                    <p className="p-3 text-sm bg-gray-100 rounded dark:bg-gray-800 font-mono">
                      {errorTime}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="environment" className="mt-4">
              <div className="p-3 overflow-auto text-xs bg-gray-100 rounded dark:bg-gray-800 max-h-[400px]">
                <h4 className="mb-2 font-medium">Browser Information</h4>
                <pre>{JSON.stringify(browserInfo, null, 2)}</pre>

                <h4 className="mt-4 mb-2 font-medium">URL Information</h4>
                <pre>
                  {JSON.stringify(
                    {
                      href: window.location.href,
                      pathname: window.location.pathname,
                      search: window.location.search,
                      hash: window.location.hash,
                    },
                    null,
                    2
                  )}
                </pre>

                <h4 className="mt-4 mb-2 font-medium">Local Storage Keys</h4>
                <pre>{JSON.stringify(Object.keys(localStorage), null, 2)}</pre>
              </div>
            </TabsContent>

            <TabsContent value="screenpipe" className="mt-4">
              <div className="p-3 overflow-auto text-xs bg-gray-100 rounded dark:bg-gray-800 max-h-[400px]">
                <h4 className="mb-2 font-medium">Screenpipe Settings</h4>
                {settings ? (
                  <pre>{JSON.stringify(settings, null, 2)}</pre>
                ) : (
                  <p>Loading Screenpipe settings...</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </Button>
          <Button onClick={() => reset()}>Try Again</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
