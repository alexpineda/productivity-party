/*
<ai_context>
Global not-found page for 404 errors.
</ai_context>
<recent_changes>
Created a global not-found page for 404 errors with debugging information.
</recent_changes>
*/

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
          <CardTitle className="text-purple-700 dark:text-purple-300">
            Page Not Found
          </CardTitle>
          <CardDescription>
            The page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-8xl font-bold text-purple-200 dark:text-purple-800">
              404
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400">
              The requested URL was not found on this server. Check the URL for
              typos or return to the home page.
            </p>

            <div className="w-full p-4 mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <h3 className="text-sm font-medium mb-2">
                Technical Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                URL:{" "}
                <span className="font-mono">
                  {typeof window !== "undefined" ? window.location.href : ""}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Time:{" "}
                <span className="font-mono">{new Date().toISOString()}</span>
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
