"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  getPartyServerHealth,
  type PartyServerHealth,
} from "@/app/actions/partykit-actions";
import { ReloadIcon } from "@radix-ui/react-icons";

export function PartyServerHealth() {
  const [health, setHealth] = useState<PartyServerHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const healthData = await getPartyServerHealth();
      setHealth(healthData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch server health"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();

    // Set up interval to fetch health data
    const interval = setInterval(fetchHealth, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const isServerDown = !health || health.status === "error";

  if (isLoading && !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PartyKit Server Health</CardTitle>
          <CardDescription>Server health information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          PartyKit Server Health
          {isServerDown ? (
            <Badge variant="destructive">Offline</Badge>
          ) : (
            <Badge variant="default" className="bg-green-500">
              Online
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Server health information</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ReloadIcon className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isServerDown ? (
          <div className="text-red-500 font-medium">
            Server is currently unreachable. Please check if the PartyKit server
            is running.
            {health?.error && (
              <div className="mt-2 text-sm bg-red-100 p-2 rounded">
                Error: {health.error}
              </div>
            )}
          </div>
        ) : health ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Active Connections
                </h3>
                <p className="text-lg font-semibold">{health.connections}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Last Update
                </h3>
                <p className="text-sm">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Status
                </h3>
                <p className="text-sm capitalize">{health.status}</p>
              </div>
            </div>

            {health.memory && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Memory Usage
                </h3>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div className="grid grid-cols-2 gap-y-2">
                    <div>Scoreboard Cache</div>
                    <div>{health.memory.scoreboardCacheSize} items</div>
                    <div>Message Queue</div>
                    <div>{health.memory.messagesQueueSize} items</div>
                    <div>Rate Limiters</div>
                    <div>{health.memory.rateLimitersCount} active</div>
                  </div>
                </div>
              </div>
            )}

            {health.database && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Database Status
                </h3>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div className="flex items-center justify-between">
                    <div>Connection Status</div>
                    <div>
                      {health.database.status === "connected" ? (
                        <Badge variant="default" className="bg-green-500">
                          Connected
                        </Badge>
                      ) : health.database.status === "error" ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : (
                        <Badge variant="outline">Unknown</Badge>
                      )}
                    </div>
                  </div>

                  {health.database.status === "error" && (
                    <div className="mt-2 text-red-500 text-xs bg-red-50 p-2 rounded">
                      Error: {health.database.error}
                    </div>
                  )}

                  {health.env_node && (
                    <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                      <div>Node Environment</div>
                      <pre className="text-xs">
                        {JSON.stringify(health.env_node, null, 2)}
                      </pre>
                    </div>
                  )}

                  {health.env_partykit && (
                    <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                      <div>PartyKit Environment</div>
                      <pre className="text-xs">
                        {JSON.stringify(health.env_partykit, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-amber-500 font-medium">
            Waiting for health data from server...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
