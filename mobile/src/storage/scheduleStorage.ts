import AsyncStorage from '@react-native-async-storage/async-storage';

import { Course, TransitBufferMinutes } from '../types/schedule';

const STORAGE_KEY = '@schedUp/schedule';
export const PREFERENCES_KEY = '@schedUp/preferences';

export interface StudentProfile {
  fullName: string;
  school: string;
  program: string;
  yearLevel: string;
  semesterDates: string;
  classLoadType: 'regular' | 'irregular';
  timezone: string;
  weekStartDay: 'Sunday' | 'Monday';
  activeHoursStart: string;
  activeHoursEnd: string;
  doNotScheduleStart: string;
  doNotScheduleEnd: string;
  sleepWindowStart: string;
  sleepWindowEnd: string;
  peakFocusTime: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  commuteBufferMinutes: TransitBufferMinutes;
  studySessionMinutes: number;
  breakMinutes: number;
  reminderLeadTimeMinutes: number;
  notificationChannels: ('push' | 'email')[];
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface AppPreferences {
  themeMode: 'system' | 'light' | 'dark';
  timeFormat: '12h' | '24h';
  allowBackToBack: boolean;
  transitBufferMinutes: TransitBufferMinutes;
  autoMergeDuplicates: boolean;
  colorCodingBySubject: boolean;
  compactView: boolean;
  studentProfile: StudentProfile;
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  fullName: '',
  school: '',
  program: '',
  yearLevel: '',
  semesterDates: '',
  classLoadType: 'regular',
  timezone: 'Asia/Manila',
  weekStartDay: 'Monday',
  activeHoursStart: '08:00',
  activeHoursEnd: '22:00',
  doNotScheduleStart: '12:00',
  doNotScheduleEnd: '13:00',
  sleepWindowStart: '23:00',
  sleepWindowEnd: '06:00',
  peakFocusTime: 'Morning',
  commuteBufferMinutes: 10,
  studySessionMinutes: 60,
  breakMinutes: 15,
  reminderLeadTimeMinutes: 30,
  notificationChannels: ['push', 'email'],
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  themeMode: 'system',
  timeFormat: '12h',
  allowBackToBack: true,
  transitBufferMinutes: 10,
  autoMergeDuplicates: true,
  colorCodingBySubject: true,
  compactView: false,
  studentProfile: DEFAULT_STUDENT_PROFILE,
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

    const parsed = JSON.parse(value) as Partial<AppPreferences> & { darkMode?: boolean; studentProfile?: Partial<StudentProfile> };
    const themeMode =
      parsed.themeMode === 'light' || parsed.themeMode === 'dark' || parsed.themeMode === 'system'
        ? parsed.themeMode
        : parsed.darkMode === true
          ? 'dark'
          : DEFAULT_PREFERENCES.themeMode;
    const timeFormat = parsed.timeFormat === '24h' ? '24h' : DEFAULT_PREFERENCES.timeFormat;
    const transitBufferMinutes =
      parsed.transitBufferMinutes === 0 || parsed.transitBufferMinutes === 10 || parsed.transitBufferMinutes === 15 || parsed.transitBufferMinutes === 30
        ? parsed.transitBufferMinutes
        : DEFAULT_PREFERENCES.transitBufferMinutes;

    const studentProfile: StudentProfile = {
      ...DEFAULT_STUDENT_PROFILE,
      ...parsed.studentProfile,
      commuteBufferMinutes: transitBufferMinutes,
      notificationChannels: Array.isArray(parsed.studentProfile?.notificationChannels)
        ? parsed.studentProfile!.notificationChannels.filter(
            (channel): channel is 'push' | 'email' => channel === 'push' || channel === 'email',
          )
        : DEFAULT_STUDENT_PROFILE.notificationChannels,
    };

    return {
      themeMode,
      timeFormat,
      allowBackToBack: parsed.allowBackToBack !== false,
      transitBufferMinutes,
      autoMergeDuplicates: parsed.autoMergeDuplicates !== false,
      colorCodingBySubject: parsed.colorCodingBySubject !== false,
      compactView: Boolean(parsed.compactView),
      studentProfile,
    };
  } catch (error) {
    console.warn('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(preferences: AppPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}
