import { useCallback, useEffect, useState } from 'react';

import {
  AppPreferences,
  DEFAULT_PREFERENCES,
  getPreferences,
  savePreferences,
} from '../storage/scheduleStorage';

export function usePreferences() {
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void getPreferences().then((savedPreferences) => {
      if (mounted) {
        setPreferences(savedPreferences);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (themeMode: AppPreferences['themeMode']) => {
    const nextPreferences = { ...preferences, themeMode };
    setPreferences(nextPreferences);
    await savePreferences(nextPreferences);
  }, [preferences]);

  const updatePreferences = useCallback(async (updates: Partial<AppPreferences>) => {
    const nextPreferences = { ...preferences, ...updates };
    setPreferences(nextPreferences);
    await savePreferences(nextPreferences);
  }, [preferences]);

  return {
    preferences,
    isLoading,
    setThemeMode,
    updatePreferences,
  };
}
