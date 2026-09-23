import { describe, expect, it } from 'vitest';

import { formatDisplayTime, isValidTime, timeToMinutes } from './timeUtils';

describe('timeUtils', () => {
  it('accepts valid 24-hour times', () => {
    expect(isValidTime('09:30')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
  });

  it('converts time strings to minutes', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(timeToMinutes('13:45')).toBe(825);
  });

  it('formats display times in a readable 12-hour format', () => {
    expect(formatDisplayTime('09:30')).toBe('9:30 AM');
    expect(formatDisplayTime('13:45')).toBe('1:45 PM');
  });
});
