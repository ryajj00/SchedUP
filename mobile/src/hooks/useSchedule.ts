import { createContext, useContext } from 'react';

import type { Course, CourseConflict } from '../types/schedule';

export interface ScheduleContextValue {
  courses: Course[];
  conflicts: CourseConflict[];
  isLoading: boolean;
  addCourse: (course: Omit<Course, 'id'>) => Promise<Course>;
  addCourses: (courses: Omit<Course, 'id'>[]) => Promise<Course[]>;
  updateCourse: (course: Course) => Promise<Course>;
  deleteCourse: (courseId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within ScheduleProvider.');
  }
  return context;
}
