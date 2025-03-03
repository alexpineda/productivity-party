/**
 * @file navbar.tsx
 * @description
 * Provides a simple top navigation bar for the application. It includes links
 * to the "Home," "Profile," "Leaderboard," and "Chat" pages.
 *
 * Key Features:
 * - Uses Next.js <Link> components for client-side transitions
 * - Renders a horizontal bar with clickable nav items
 * - Highlights or styles the currently active link (optional extension)
 *
 * @notes
 * - Imported by the layout in (app)/layout.tsx to ensure all app pages share the same nav
 * - You could further expand this to handle user info, sign out, or theming toggles
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Rocket, PartyPopper } from "lucide-react";

/**
 * @interface NavItem
 * Represents a single link in the Navbar
 */
interface NavItem {
  label: string;
  href: string;
}

/**
 * @constant NAV_ITEMS
 * An array of navigation items displayed in the top nav
 * @type {NavItem[]}
 */
const NAV_ITEMS: NavItem[] = [
  { label: "Profile", href: "/profile" },
  { label: "Productivity", href: "/productivity" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Chat", href: "/chat" },
];

// Check if we're in development environment
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * @function Navbar
 * Renders a horizontal navigation bar with clickable links
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Example brand logo or name */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Rocket className="h-5 w-5 text-blue-500 transform transition-transform group-hover:-translate-y-1 group-hover:rotate-12" />
            <PartyPopper className="h-4 w-4 text-amber-500 absolute -right-2 -bottom-1 transform transition-all group-hover:scale-125" />
          </div>
          <div className="font-bold text-lg">Productivity Party</div>
        </Link>

        {/* Navigation links */}
        <ul className="flex items-center space-x-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100",
                    isActive && "bg-gray-100 text-blue-600"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Debug link - only visible in development */}
          {isDevelopment && (
            <li>
              <Link
                href="/debug"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 text-amber-600",
                  pathname === "/debug" && "bg-gray-100 text-amber-700"
                )}
              >
                Debug
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
