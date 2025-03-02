/*
<ai_context>
Client component for displaying settings with syntax highlighting.
</ai_context>
<recent_changes>
Created a new client component for displaying settings in a formatted JSON view with syntax highlighting.
Fixed linter errors by removing ScrollArea and fixing string escaping issues.
</recent_changes>
*/

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon, SearchIcon, EyeIcon, EyeOffIcon } from "lucide-react";

interface SettingsDisplayProps {
  settings: Record<string, any>;
}

export default function SettingsDisplay({ settings }: SettingsDisplayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [hideSecrets, setHideSecrets] = useState(true);

  // Function to mask sensitive values
  const maskSensitiveValue = (key: string, value: any) => {
    const sensitiveKeys = [
      "apiKey",
      "token",
      "key",
      "secret",
      "password",
      "credential",
    ];

    if (
      hideSecrets &&
      typeof value === "string" &&
      value.length > 5 &&
      sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))
    ) {
      return "••••••••••••••••";
    }

    return value;
  };

  // Function to format the settings object with syntax highlighting
  const formatSettings = (
    obj: Record<string, any>,
    indent = 0
  ): JSX.Element => {
    const indentStr = "  ".repeat(indent);

    return (
      <>
        {"{"}
        {Object.entries(obj)
          .filter(
            ([key]) =>
              searchTerm === "" ||
              key.toLowerCase().includes(searchTerm.toLowerCase()) ||
              JSON.stringify(obj[key])
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          )
          .map(([key, value], index, array) => {
            const isLast = index === array.length - 1;
            const displayValue = maskSensitiveValue(key, value);

            if (typeof displayValue === "object" && displayValue !== null) {
              return (
                <div key={key} className="ml-4">
                  <span className="text-blue-500">&quot;{key}&quot;</span>
                  <span className="text-gray-500">: </span>
                  {Array.isArray(displayValue) ? (
                    <>
                      {"["}
                      <div className="ml-4">
                        {displayValue.map((item, i) => (
                          <div key={i}>
                            {typeof item === "object" && item !== null ? (
                              formatSettings(
                                item as Record<string, any>,
                                indent + 2
                              )
                            ) : (
                              <span
                                className={
                                  typeof item === "string"
                                    ? "text-green-500"
                                    : "text-yellow-500"
                                }
                              >
                                {typeof item === "string"
                                  ? `&quot;${item}&quot;`
                                  : String(item)}
                              </span>
                            )}
                            {i < displayValue.length - 1 && (
                              <span className="text-gray-500">,</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {"]"}
                    </>
                  ) : (
                    formatSettings(
                      displayValue as Record<string, any>,
                      indent + 1
                    )
                  )}
                  {!isLast && <span className="text-gray-500">,</span>}
                </div>
              );
            }

            return (
              <div key={key} className="ml-4">
                <span className="text-blue-500">&quot;{key}&quot;</span>
                <span className="text-gray-500">: </span>
                {typeof displayValue === "string" ? (
                  <span className="text-green-500">
                    &quot;{displayValue}&quot;
                  </span>
                ) : displayValue === null ? (
                  <span className="text-red-500">null</span>
                ) : (
                  <span className="text-yellow-500">
                    {String(displayValue)}
                  </span>
                )}
                {!isLast && <span className="text-gray-500">,</span>}
              </div>
            );
          })}
        {"}"}
      </>
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setHideSecrets(!hideSecrets)}
          title={
            hideSecrets ? "Show sensitive values" : "Hide sensitive values"
          }
        >
          {hideSecrets ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          title="Copy settings to clipboard"
        >
          <CopyIcon className="h-4 w-4" />
        </Button>
      </div>

      {copied && (
        <div className="bg-green-100 dark:bg-green-900 p-2 rounded text-center text-sm">
          Settings copied to clipboard!
        </div>
      )}

      <div className="h-[500px] rounded-md border p-4 font-mono text-sm overflow-auto">
        <pre className="whitespace-pre-wrap break-all">
          {formatSettings(settings)}
        </pre>
      </div>
    </div>
  );
}
