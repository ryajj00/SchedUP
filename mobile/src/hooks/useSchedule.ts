import { useCallback, useEffect, useMemo, useState } from 'react';

import { Course, CourseConflict } from '../types/schedule';
import { findConflicts } from '../utils/conflictDetection';
import { clearSchedule, getSchedule, saveSchedule } from '../storage/scheduleStorage';

export function useSchedule() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    const savedCourses = await getSchedule();
    setCourses(savedCourses);
    setIsLoading(false);
  }, []);

  const persistSchedule = useCallback(async (nextCourses: Course[]) => {
    await saveSchedule(nextCourses);
    setCourses(nextCourses);
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const addCourse = useCallback(
    async (course: Omit<Course, 'id'>) => {
      const newCourse: Course = {
        ...course,
        id: `course-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      };

      const nextCourses = [...courses, newCourse];
      await persistSchedule(nextCourses);
      return newCourse;
    },
    [courses, persistSchedule],
  );

  const updateCourse = useCallback(
    async (updatedCourse: Course) => {
      const nextCourses = courses.map((course) => (course.id === updatedCourse.id ? updatedCourse : course));
      await persistSchedule(nextCourses);
      return updatedCourse;
    },
    [courses, persistSchedule],
  );

  const deleteCourse = useCallback(
    async (courseId: string) => {
      const nextCourses = courses.filter((course) => course.id !== courseId);
      await persistSchedule(nextCourses);
    },
    [courses, persistSchedule],
  );

  const clearAll = useCallback(async () => {
    await clearSchedule();
    setCourses([]);
  }, []);

  const conflicts = useMemo<CourseConflict[]>(() => findConflicts(courses), [courses]);

  return {
    courses,
    conflicts,
    isLoading,
    addCourse,
    updateCourse,
    deleteCourse,
    clearAll,
    refresh: loadSchedule,
  };
}
