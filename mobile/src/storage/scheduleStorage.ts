import AsyncStorage from '@react-native-async-storage/async-storage';

import { Course } from '../types/schedule';

const STORAGE_KEY = '@schedUp/schedule';
export const PREFERENCES_KEY = '@schedUp/preferences';

export interface AppPreferences {
  themeMode: 'system' | 'light' | 'dark';
  timeFormat: '12h' | '24h';
  allowBackToBack: boolean;
  transitBufferMinutes: 0 | 10 | 15;
  autoMergeDuplicates: boolean;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  themeMode: 'system',
  timeFormat: '12h',
  allowBackToBack: true,
  transitBufferMinutes: 10,
  autoMergeDuplicates: true,
};

export async function getSchedule(): Promise<Course[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);

    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is Course => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const course = item as Partial<Course>;
      return (
        typeof course.id === 'string' &&
        typeof course.courseName === 'string' &&
        Array.isArray(course.days) &&
        typeof course.startTime === 'string' &&
        typeof course.endTime === 'string' &&
        (course.source === 'manual' || course.source === 'scan')
      );
    });
  } catch (error) {
    console.warn('Failed to load schedule:', error);
    return [];
  }
}

export async function saveSchedule(courses: Course[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export async function clearSchedule(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getPreferences(): Promise<AppPreferences> {
  try {
    const value = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!value) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(value) as Partial<AppPreferences> & { darkMode?: boolean };
    const themeMode =
      parsed.themeMode === 'light' || parsed.themeMode === 'dark' || parsed.themeMode === 'system'
        ? parsed.themeMode
        : parsed.darkMode === true
          ? 'dark'
          : DEFAULT_PREFERENCES.themeMode;
    const timeFormat = parsed.timeFormat === '24h' ? '24h' : DEFAULT_PREFERENCES.timeFormat;
    const transitBufferMinutes =
      parsed.transitBufferMinutes === 0 || parsed.transitBufferMinutes === 15
        ? parsed.transitBufferMinutes
        : DEFAULT_PREFERENCES.transitBufferMinutes;

    return {
      themeMode,
      timeFormat,
      allowBackToBack: parsed.allowBackToBack !== false,
      transitBufferMinutes,
      autoMergeDuplicates: parsed.autoMergeDuplicates !== false,
    };
  } catch (error) {
    console.warn('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(preferences: AppPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}
