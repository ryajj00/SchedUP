import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePreferences } from '../hooks/usePreferences';
import { ScheduleContext } from '../hooks/useSchedule';
import { clearSchedule, getSchedule, saveSchedule } from '../storage/scheduleStorage';
import type { Course, CourseConflict } from '../types/schedule';
import { findConflicts } from '../utils/conflictDetection';

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const { preferences, isLoading: arePreferencesLoading } = usePreferences();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const coursesRef = useRef(courses);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedCourses = await getSchedule();
      coursesRef.current = savedCourses;
      setCourses(savedCourses);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      void loadSchedule();
    }, 0);

    return () => clearTimeout(loadTimer);
  }, [loadSchedule]);

  const persistSchedule = useCallback(async (nextCourses: Course[]) => {
    await saveSchedule(nextCourses);
    coursesRef.current = nextCourses;
    setCourses(nextCourses);
  }, []);

  const addCourse = useCallback(async (course: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    };
    await persistSchedule([...coursesRef.current, newCourse]);
    return newCourse;
  }, [persistSchedule]);

  const addCourses = useCallback(async (courseInputs: Omit<Course, 'id'>[]) => {
    const newCourses = courseInputs.map((course) => ({
      ...course,
      id: `course-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    }));
    await persistSchedule([...coursesRef.current, ...newCourses]);
    return newCourses;
  }, [persistSchedule]);

  const updateCourse = useCallback(async (updatedCourse: Course) => {
    const nextCourses = coursesRef.current.map((course) => course.id === updatedCourse.id ? updatedCourse : course);
    await persistSchedule(nextCourses);
    return updatedCourse;
  }, [persistSchedule]);

  const deleteCourse = useCallback(async (courseId: string) => {
    const nextCourses = coursesRef.current.filter((course) => course.id !== courseId);
    await persistSchedule(nextCourses);
  }, [persistSchedule]);

  const clearAll = useCallback(async () => {
    await clearSchedule();
    coursesRef.current = [];
    setCourses([]);
  }, []);

  const conflicts = useMemo<CourseConflict[]>(
    () => findConflicts(courses, preferences.allowBackToBack, preferences.transitBufferMinutes),
    [courses, preferences.allowBackToBack, preferences.transitBufferMinutes],
  );

  return (
    <ScheduleContext.Provider value={{
      courses,
      conflicts,
      isLoading: isLoading || arePreferencesLoading,
      addCourse,
      addCourses,
      updateCourse,
      deleteCourse,
      clearAll,
      refresh: loadSchedule,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}
