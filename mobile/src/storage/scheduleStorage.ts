import AsyncStorage from '@react-native-async-storage/async-storage';

import { Course } from '../types/schedule';

const STORAGE_KEY = '@schedUp/schedule';

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
