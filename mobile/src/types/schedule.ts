export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type CourseSource = 'manual' | 'scan';
export type TransitBufferMinutes = 0 | 10 | 15 | 30;

export interface Course {
  id: string;
  courseName: string;
  days: Day[];
  startTime: string;
  endTime: string;
  source: CourseSource;
}

export interface ScannedCourse {
  courseName: string;
  days: Day[];
  startTime: string;
  endTime: string;
  uncertain: boolean;
  uncertaintyReason?: string;
}

export interface CourseConflict {
  courseAId: string;
  courseBId: string;
  day: Day;
  reason: 'overlap' | 'travel-buffer' | 'back-to-back';
}
