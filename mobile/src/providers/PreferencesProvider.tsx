import React, { useCallback, useEffect, useRef, useState } from 'react';

import { PreferencesContext } from '../hooks/usePreferences';
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  savePreferences,
} from '../storage/scheduleStorage';
import type { AppPreferences } from '../storage/scheduleStorage';

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const preferencesRef = useRef(preferences);
  const pendingWrites = useRef(Promise.resolve());
  const hasLocalUpdate = useRef(false);

  useEffect(() => {
    let mounted = true;

    void getPreferences().then((savedPreferences) => {
      if (mounted) {
        if (!hasLocalUpdate.current) {
          preferencesRef.current = savedPreferences;
          setPreferences(savedPreferences);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<AppPreferences>) => {
    hasLocalUpdate.current = true;
    const nextPreferences = { ...preferencesRef.current, ...updates };
    preferencesRef.current = nextPreferences;
    setPreferences(nextPreferences);

    const write = pendingWrites.current.then(() => savePreferences(nextPreferences));
    pendingWrites.current = write.catch(() => undefined);
    await write;
  }, []);

  const setThemeMode = useCallback(
    (themeMode: AppPreferences['themeMode']) => updatePreferences({ themeMode }),
    [updatePreferences],
  );

  return (
    <PreferencesContext.Provider value={{ preferences, isLoading, setThemeMode, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}
