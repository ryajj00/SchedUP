export function timeToMinutes(time: string): number {
  if (!isValidTime(time)) {
    return Number.NaN;
  }

  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isValidTime(time: string): boolean {
  if (typeof time !== 'string') {
    return false;
  }

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  return Boolean(match);
}

export function formatDisplayTime(time: string): string {
  if (!isValidTime(time)) {
    return time;
  }

  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatDisplayTime(startTime)} – ${formatDisplayTime(endTime)}`;
}
