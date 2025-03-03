/*
<ai_context>
Type definitions for plugin settings.
</ai_context>
<recent_changes>
Created PipeSettings interface to define the structure of our plugin settings.
</recent_changes>
*/

import { ProductivityBlock } from "./productivity-types";

/**
 * Represents the structure of settings stored under customSettings.pipe
 */
export interface PipeSettings {
  // Productivity settings
  productivityScore: number;
  processedBlocks: ProductivityBlock[];

  // User preferences
  nickname?: string;
  currentTask?: string;
  role?: string;

  // App configuration
  prompt?: string;
  vaultPath?: string;
  logTimeWindow?: number;
  logPageSize?: number;
  logModel?: string;
  analysisModel?: string;
  analysisTimeWindow?: number;
  deduplicationEnabled?: boolean;

  // Debug settings
  debugKey?: string;

  // Any other plugin-specific settings
  [key: string]: any;
}
