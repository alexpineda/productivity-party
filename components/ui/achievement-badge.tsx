/**
 * @file achievement-badge.tsx
 * @description
 * A small UI component that renders a single achievement badge,
 * including an icon, the achievement’s name, and description.
 *
 * Props:
 * - achievement: { name: string; description: string; }
 * - optional className or styling props
 *
 * @notes
 * - This component is purely for display. You can place it in your
 *   user profile page, scoreboard page, or a “toast” message.
 * - If you want to handle multiple achievements, just map them
 *   to multiple <AchievementBadge> components.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { type Achievement } from "@/app/actions/achievement-actions";
// import { Trophy } from "lucide-react";  // or any icon you like from icons.tsx

interface AchievementBadgeProps {
  achievement: Achievement;
  className?: string;
}

export function AchievementBadge({
  achievement,
  className,
}: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-start border border-amber-500 bg-amber-50 rounded-md p-3 gap-3",
        className
      )}
    >
      {/* Replace with any icon you prefer. For example: */}
      {/* <Trophy className="h-5 w-5 text-amber-500 mt-0.5" /> */}
      <div className="h-5 w-5 mt-0.5 rounded-full bg-amber-400" />

      <div className="text-sm text-amber-900">
        <div className="font-semibold">{achievement.name}</div>
        <div className="text-xs">{achievement.description}</div>
      </div>
    </div>
  );
}
