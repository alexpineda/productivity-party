/*
<ai_context>
Utility functions for server-side settings management.
</ai_context>
<recent_changes>
Updated to use PipeSettings interface for better type safety.
</recent_changes>
*/

import { pipe } from "@screenpipe/js";
import { PipeSettings } from "@/lib/types/settings-types";

/**
 * Get a specific setting from the pipe namespace with type inference
 *
 * @param key The setting key to retrieve
 * @param defaultValue Default value if setting doesn't exist
 * @returns The setting value or default value
 */
export async function getPipeSetting<K extends keyof PipeSettings>(
  key: K,
  defaultValue: PipeSettings[K]
): Promise<PipeSettings[K]> {
  const settings = await pipe.settings.getAll();
  const value = settings.customSettings?.pipe?.[key];
  return (value !== undefined ? value : defaultValue) as PipeSettings[K];
}

/**
 * Get all pipe settings
 *
 * @returns All settings in the pipe namespace
 */
export async function getAllPipeSettings(): Promise<Partial<PipeSettings>> {
  const settings = await pipe.settings.getAll();
  return settings.customSettings?.pipe || {};
}

/**
 * Update pipe settings with new values
 *
 * @param newSettings The new settings to update
 * @returns A promise that resolves when settings are updated
 */
export async function updatePipeSettings(
  newSettings: Partial<PipeSettings>
): Promise<void> {
  const settings = await pipe.settings.getAll();

  await pipe.settings.update({
    customSettings: {
      ...settings.customSettings,
      pipe: {
        ...settings.customSettings?.pipe,
        ...newSettings,
      },
    },
  });
}
