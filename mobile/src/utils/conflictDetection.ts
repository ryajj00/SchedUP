import { Course, CourseConflict, Day } from '../types/schedule';
import { timeToMinutes } from './timeUtils';

export function coursesShareDay(courseA: Pick<Course, 'days'>, courseB: Pick<Course, 'days'>): boolean {
  return courseA.days.some((day) => courseB.days.includes(day));
}

export function coursesOverlap(courseA: Pick<Course, 'startTime' | 'endTime'>, courseB: Pick<Course, 'startTime' | 'endTime'>): boolean {
  const startA = timeToMinutes(courseA.startTime);
  const endA = timeToMinutes(courseA.endTime);
  const startB = timeToMinutes(courseB.startTime);
  const endB = timeToMinutes(courseB.endTime);

  if ([startA, endA, startB, endB].some((value) => Number.isNaN(value))) {
    return false;
  }

  return startA < endB && endA > startB;
}

export function findConflicts(courses: Course[]): CourseConflict[] {
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

        if (coursesOverlap(courseAOnDay, courseBOnDay)) {
          conflicts.push({
            courseAId: courseA.id,
            courseBId: courseB.id,
            day,
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
