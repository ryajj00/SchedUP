export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type CourseSource = 'manual' | 'scan';

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
}
