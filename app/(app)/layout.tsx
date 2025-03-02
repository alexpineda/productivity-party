/**
 * @file layout.tsx
 * @description
 * This file defines a nested layout for all routes under the `(app)/` directory.
 * It wraps its children in a consistent top navigation bar (Navbar) so that
 * pages like Chat, Leaderboard, and Profile share the same layout.
 *
 * Key Features:
 * - Imports and renders the Navbar component at the top
 * - Renders child pages in a main area beneath the nav
 * - Ensures consistent design and easy navigation between the app pages
 *
 * @notes
 * - Next.js automatically applies this layout to all routes in `(app)/`
 * - The user can click the nav links to switch between '/profile', '/leaderboard', '/chat', etc.
 */

import React from "react";
import { Navbar } from "@/components/ui/navbar";

/**
 * @function Layout
 * @param props.children - The page content nested under this layout
 * @returns The overall layout with a Navbar on top and the page content below
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
