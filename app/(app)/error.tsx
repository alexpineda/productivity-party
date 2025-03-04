/*
<ai_context>
Global error page for the app directory with debugging capabilities.
</ai_context>
<recent_changes>
Created a global error page for the app directory with debugging information.
</recent_changes>
*/

"use client";

import { useEffect } from "react";
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
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App directory error:", error);
  }, [error]);

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
          <CardTitle className="text-blue-700 dark:text-blue-300">
            Application Error
          </CardTitle>
          <CardDescription>
            An unexpected error has occurred in the application. Technical
            details are available below.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Error Message</h3>
            <p className="p-3 mt-1 text-sm bg-gray-100 rounded dark:bg-gray-800 font-mono">
              {error.message || "Unknown error"}
            </p>
          </div>

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
          </Accordion>
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
