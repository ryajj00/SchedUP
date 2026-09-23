import test from 'node:test';
import assert from 'node:assert/strict';

import { scanResponseSchema } from './scheduleSchema';

test('accepts valid scanned course payloads', () => {
  const payload = {
    courses: [
      {
        courseName: 'Programming 1',
        days: ['Mon', 'Wed'],
        startTime: '09:00',
        endTime: '10:30',
        uncertain: false,
      },
    ],
  };

  assert.doesNotThrow(() => scanResponseSchema.parse(payload));
});

test('rejects end time before start time', () => {
  const payload = {
    courses: [
      {
        courseName: 'Math',
        days: ['Tue'],
        startTime: '10:00',
        endTime: '09:00',
        uncertain: false,
      },
    ],
  };

  assert.throws(() => scanResponseSchema.parse(payload));
});
