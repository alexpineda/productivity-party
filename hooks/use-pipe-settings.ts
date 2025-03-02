import { useState, useEffect } from "react";
import { Settings } from "@/lib/types";
import {
  getScreenpipeAppSettings,
  updateScreenpipeAppSettings,
} from "@/lib/actions/get-screenpipe-app-settings";

export function usePipeSettings() {
  const [settings, setSettings] = useState<Partial<Settings> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load screenpipe app settings
      const screenpipeSettings = await getScreenpipeAppSettings();

      console.log("loaded settings:", screenpipeSettings);

      // Merge with defaults
      setSettings({
        ...screenpipeSettings.customSettings?.pipe,
        screenpipeAppSettings: screenpipeSettings,
      });
    } catch (error) {
      console.error("failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      // Split settings
      const { screenpipeAppSettings, ...pipeSettings } = newSettings;

      // Update screenpipe settings
      await updateScreenpipeAppSettings({
        ...screenpipeAppSettings,
        customSettings: {
          ...screenpipeAppSettings?.customSettings,
          pipe: pipeSettings,
        },
      });

      // Update local state
      setSettings({
        ...pipeSettings,
        screenpipeAppSettings:
          screenpipeAppSettings || settings?.screenpipeAppSettings,
      });

      console.log("settings updated successfully");
      return true;
    } catch (error) {
      console.error("failed to update settings:", error);
      return false;
    }
  };

  return { settings, updateSettings, loading };
}
