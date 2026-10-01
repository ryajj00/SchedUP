import { describe, expect, it } from 'vitest';

import { Course } from '../types/schedule';
import { coursesOverlap, findConflicts } from './conflictDetection';

const course = (overrides: Partial<Course>): Course => ({
  id: 'course-id',
  courseName: 'Sample',
  days: ['Mon'],
  startTime: '09:00',
  endTime: '10:00',
  source: 'manual',
  ...overrides,
});

describe('conflictDetection', () => {
  it('returns false for back-to-back classes', () => {
    expect(
      coursesOverlap(
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
      ),
    ).toBe(false);
  });

  it('can flag back-to-back classes when the preference is disabled', () => {
    expect(
      coursesOverlap(
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
        false,
      ),
    ).toBe(true);
  });

  it('flags classes with less than the selected travel buffer', () => {
    expect(
      coursesOverlap(
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:05', endTime: '11:00' },
        true,
        10,
      ),
    ).toBe(true);
    expect(
      coursesOverlap(
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:10', endTime: '11:00' },
        true,
        10,
      ),
    ).toBe(false);
  });

  it('returns true for partial overlap', () => {
    expect(
      coursesOverlap(
        { startTime: '09:00', endTime: '10:30' },
        { startTime: '10:00', endTime: '11:00' },
      ),
    ).toBe(true);
  });

  it('detects conflict only on a shared day', () => {
    const courses = [
      course({ id: 'a', days: ['Mon', 'Wed'], startTime: '09:00', endTime: '10:00' }),
      course({ id: 'b', days: ['Wed', 'Fri'], startTime: '09:30', endTime: '10:30' }),
    ];

    expect(findConflicts(courses)).toEqual([
      {
        courseAId: 'a',
        courseBId: 'b',
        day: 'Wed',
        reason: 'overlap',
      },
    ]);
  });

  it('returns no conflict for classes on different days', () => {
    const courses = [
      course({ id: 'a', days: ['Mon'], startTime: '09:00', endTime: '10:00' }),
      course({ id: 'b', days: ['Tue'], startTime: '09:30', endTime: '10:30' }),
    ];

    expect(findConflicts(courses)).toEqual([]);
  });

  it('identifies short travel gaps as travel-buffer conflicts', () => {
    const courses = [
      course({ id: 'a', startTime: '09:00', endTime: '10:00' }),
      course({ id: 'b', startTime: '10:05', endTime: '11:00' }),
    ];

    expect(findConflicts(courses, true, 10)).toEqual([
      {
        courseAId: 'a',
        courseBId: 'b',
        day: 'Mon',
        reason: 'travel-buffer',
      },
    ]);
  });
});
