/*
<ai_context>
Global error page for Next.js that displays detailed error information in production.
</ai_context>
<recent_changes>
Created a new error page with debugging capabilities for production use.
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

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <CardTitle className="text-red-700 dark:text-red-300">
            Application Error
          </CardTitle>
          <CardDescription>
            An unexpected error has occurred. Technical details are available
            below.
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

            <AccordionItem value="component-tree">
              <AccordionTrigger>Component Tree</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-500">
                  The error occurred in the component tree. Check the console
                  for more details.
                </p>
              </AccordionContent>
            </AccordionItem>
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
