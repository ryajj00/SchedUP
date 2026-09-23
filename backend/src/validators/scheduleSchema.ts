import { z } from 'zod';

export const DayEnum = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

export const scannedCourseSchema = z.object({
  courseName: z.string().trim().min(1, 'Course name is required.'),
  days: z.array(DayEnum).min(1, 'At least one day is required.'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  uncertain: z.boolean().default(false),
  uncertaintyReason: z.string().optional(),
}).refine((course) => {
  const startMinutes = Number(course.startTime.split(':')[0]) * 60 + Number(course.startTime.split(':')[1]);
  const endMinutes = Number(course.endTime.split(':')[0]) * 60 + Number(course.endTime.split(':')[1]);
  return endMinutes > startMinutes;
}, {
  message: 'endTime must be later than startTime.',
  path: ['endTime'],
});

export const scanResponseSchema = z.object({
  courses: z.array(scannedCourseSchema),
});
