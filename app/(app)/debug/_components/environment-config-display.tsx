"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClientOnly } from "@/lib/client-only";
import * as config from "@/config";

export default function EnvironmentConfigDisplay() {
  const [copied, setCopied] = useState(false);

  // Get all exported values from config
  const configValues = {
    NODE_ENV: process.env.NODE_ENV || "development",
    ...Object.entries(config).reduce((acc, [key, value]) => {
      return { ...acc, [key]: value };
    }, {}),
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(configValues, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatValue = (value: any): JSX.Element => {
    if (value === null) return <span className="text-red-500">null</span>;

    if (typeof value === "boolean")
      return <span className="text-purple-500">{String(value)}</span>;

    if (typeof value === "number")
      return <span className="text-yellow-500">{value}</span>;

    if (typeof value === "string")
      return <span className="text-green-500">{value}</span>;

    if (typeof value === "object")
      return <span className="text-gray-500">{JSON.stringify(value)}</span>;

    return <span>{String(value)}</span>;
  };

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Environment & Configuration</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            title="Copy configuration to clipboard"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {copied && (
            <div className="bg-green-100 dark:bg-green-900 p-2 mb-4 rounded text-center text-sm">
              Configuration copied to clipboard!
            </div>
          )}

          <div className="rounded-md border p-4 font-mono text-sm overflow-auto max-h-[500px]">
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(configValues).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="text-blue-500 font-semibold min-w-[200px] mr-2">
                    {key}:
                  </span>
                  {formatValue(value)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  );
}
