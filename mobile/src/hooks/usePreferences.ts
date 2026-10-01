import { createContext, useContext } from 'react';

import type { AppPreferences } from '../storage/scheduleStorage';

export interface PreferencesContextValue {
  preferences: AppPreferences;
  isLoading: boolean;
  setThemeMode: (themeMode: AppPreferences['themeMode']) => Promise<void>;
  updatePreferences: (updates: Partial<AppPreferences>) => Promise<void>;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider.');
  }
  return context;
}
