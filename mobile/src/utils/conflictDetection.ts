import { Course, CourseConflict, Day } from '../types/schedule';
import { timeToMinutes } from './timeUtils';

import type { TransitBufferMinutes } from '../types/schedule';

export function coursesShareDay(courseA: Pick<Course, 'days'>, courseB: Pick<Course, 'days'>): boolean {
  return courseA.days.some((day) => courseB.days.includes(day));
}

export function coursesOverlap(
  courseA: Pick<Course, 'startTime' | 'endTime'>,
  courseB: Pick<Course, 'startTime' | 'endTime'>,
  allowBackToBack = true,
  transitBufferMinutes: TransitBufferMinutes = 0,
): boolean {
  return getConflictReason(courseA, courseB, allowBackToBack, transitBufferMinutes) !== null;
}

function getConflictReason(
  courseA: Pick<Course, 'startTime' | 'endTime'>,
  courseB: Pick<Course, 'startTime' | 'endTime'>,
  allowBackToBack: boolean,
  transitBufferMinutes: TransitBufferMinutes,
): CourseConflict['reason'] | null {
  const startA = timeToMinutes(courseA.startTime);
  const endA = timeToMinutes(courseA.endTime);
  const startB = timeToMinutes(courseB.startTime);
  const endB = timeToMinutes(courseB.endTime);

  if ([startA, endA, startB, endB].some((value) => Number.isNaN(value))) {
    return null;
  }

  if (startA < endB && endA > startB) {
    return 'overlap';
  }

  const gapAB = startB - endA;
  const gapBA = startA - endB;
  if (gapAB === 0 || gapBA === 0) {
    return allowBackToBack ? null : 'back-to-back';
  }

  return (gapAB > 0 && gapAB < transitBufferMinutes) || (gapBA > 0 && gapBA < transitBufferMinutes)
    ? 'travel-buffer'
    : null;
}

export function findConflicts(
  courses: Course[],
  allowBackToBack = true,
  transitBufferMinutes: TransitBufferMinutes = 0,
): CourseConflict[] {
  const conflicts: CourseConflict[] = [];

  for (let index = 0; index < courses.length; index += 1) {
    for (let comparisonIndex = index + 1; comparisonIndex < courses.length; comparisonIndex += 1) {
      const courseA = courses[index];
      const courseB = courses[comparisonIndex];

      if (!coursesShareDay(courseA, courseB)) {
        continue;
      }

      const sharedDays = courseA.days.filter((day) => courseB.days.includes(day));

      for (const day of sharedDays) {
        const courseAOnDay = { startTime: courseA.startTime, endTime: courseA.endTime };
        const courseBOnDay = { startTime: courseB.startTime, endTime: courseB.endTime };

        const reason = getConflictReason(courseAOnDay, courseBOnDay, allowBackToBack, transitBufferMinutes);
        if (reason) {
          conflicts.push({
            courseAId: courseA.id,
            courseBId: courseB.id,
            day,
            reason,
          });
        }
      }
    }
  }

  return conflicts;
}

export function getDaysForCourse(course: Pick<Course, 'days'>): Day[] {
  return [...course.days];
}
