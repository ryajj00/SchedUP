import { ScannedCourse } from '../types/schedule';

const API_URL = 'http://localhost:3000/api/scan-schedule';

export async function scanSchedule(imageUri: string): Promise<ScannedCourse[]> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageUri,
      mimeType: 'image/jpeg',
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || 'Unable to analyze the schedule image.');
  }

  const parsed = (await response.json()) as { courses?: ScannedCourse[] };
  return Array.isArray(parsed.courses) ? parsed.courses : [];
}
