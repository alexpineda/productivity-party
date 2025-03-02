/**
 * @file app-types.ts
 * @description
 * This file provides fundamental domain-level and settings-related interfaces
 * for the application. Originally, these types existed in multiple places.
 * Now they're consolidated here to ensure clarity and a single source of truth.
 *
 * Key Exports:
 * - AppSettings: Extends and wraps Screenpipe's settings with custom plugin fields
 * - WorkLog: Represents a user-defined log or record of activities
 * - Contact & Intelligence: Example domain interfaces for future expansions
 *
 * @dependencies
 * - ScreenpipeAppSettings from '@screenpipe/js' for referencing base plugin settings
 *
 * @notes
 * - Ensure that references to ScreenpipeAppSettings remain valid
 * - Additional fields can be added to AppSettings as the plugin evolves
 */

import type { Settings as ScreenpipeAppSettings } from "@screenpipe/js";

/**
 * Represents the typical shape of the plugin's extended settings.
 * Includes the official Screenpipe settings plus any plugin-specific fields.
 */
export interface AppSettings {
  /**
   * The main user prompt or text used by AI-based features (for example,
   * summarizing or analyzing user activity).
   */
  prompt: string;

  /**
   * A file path (if needed) for storing logs or user data.
   */
  vaultPath?: string;

  /**
   * The time window (in minutes) for logs or analysis sessions.
   */
  logTimeWindow?: number;

  /**
   * Pagination size for logs or other listings.
   */
  logPageSize?: number;

  /**
   * The LLM model used for log-related tasks.
   */
  logModel?: string;

  /**
   * The LLM model used for advanced or special analyses.
   */
  analysisModel?: string;

  /**
   * The time window (in minutes or hours) for more in-depth analyses.
   */
  analysisTimeWindow?: number;

  /**
   * Whether deduplication is enabled for repeated content.
   */
  deduplicationEnabled?: boolean;

  /**
   * The official screenpipe settings object for this plugin,
   * retrieved via pipe.settings.getAll().
   */
  screenpipeAppSettings: ScreenpipeAppSettings;
}

/**
 * Represents a basic work log entry that the user might keep
 * for their day-to-day tasks or project tracking.
 */
export interface WorkLog {
  /**
   * Short title describing the log entry (e.g., "Implement user login").
   */
  title: string;

  /**
   * Detailed description or notes about the work done.
   */
  description: string;

  /**
   * A list of tags or labels categorizing this work log.
   */
  tags: string[];

  /**
   * Start timestamp in ISO format for when the work began.
   */
  startTime: string;

  /**
   * End timestamp in ISO format for when the work ended.
   */
  endTime: string;
}

/**
 * Represents a contact in the user's domain. This could be
 * a client, colleague, etc.
 */
export interface Contact {
  /**
   * Name of the contact.
   */
  name: string;

  /**
   * Optional associated company or organization.
   */
  company?: string;

  /**
   * When was the last interaction with this contact (ISO date).
   */
  lastInteraction: string;

  /**
   * Sentiment score from -1 to +1 indicating how the last interaction felt.
   */
  sentiment: number;

  /**
   * Topics discussed with this contact (array of keywords or strings).
   */
  topics: string[];

  /**
   * Next steps or tasks to follow up on.
   */
  nextSteps: string[];
}

/**
 * A higher-level intelligence structure that might be used
 * for storing analysis results about contacts or general insights.
 */
export interface Intelligence {
  /**
   * A list of discovered or known contacts in the system.
   */
  contacts: Contact[];

  /**
   * Additional insights like follow-ups or potential opportunities
   * uncovered by AI/analysis.
   */
  insights: {
    followUps: string[];
    opportunities: string[];
  };
}
