import { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createAIProvider } from '../services/ai/providerFactory';
import { validateImageFromDataUrl } from '../utils/imageValidation';
import { scanResponseSchema } from '../validators/scheduleSchema';

const router = Router();
const requestStore = new Map<string, number>();

const requestBodySchema = z.object({
  image: z.string().min(1),
  mimeType: z.string().optional(),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function applyRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = requestStore.get(ip) ?? 0;

  if (now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    const requestCount = Number(requestStore.get(`${ip}:count`) ?? 0) + 1;
    requestStore.set(`${ip}:count`, requestCount);
    return requestCount <= RATE_LIMIT_MAX_REQUESTS;
  }

  requestStore.set(ip, now);
  requestStore.set(`${ip}:count`, 1);
  return true;
}

router.post('/api/scan-schedule', async (req: Request, res: Response) => {
  const clientIp = req.ip || 'unknown';
  if (!applyRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many scan requests. Please try again shortly.' });
  }

  try {
    const parsedBody = requestBodySchema.parse(req.body ?? {});
    const { validatedMimeType } = validateImageFromDataUrl(parsedBody.image, parsedBody.mimeType);

    const provider = createAIProvider();
    const rawResponse = await provider.extractScheduleFromImage(parsedBody.image);
    const validatedResponse = scanResponseSchema.parse(rawResponse);

    const normalizedCourses = validatedResponse.courses.map((course) => ({
      ...course,
      uncertaintyReason: course.uncertain ? course.uncertaintyReason ?? 'Review required.' : '',
    }));

    return res.status(200).json({
      courses: normalizedCourses.map((course) => ({
        courseName: course.courseName,
        days: course.days,
        startTime: course.startTime,
        endTime: course.endTime,
        uncertain: course.uncertain,
        uncertaintyReason: course.uncertaintyReason,
      })),
      mimeType: validatedMimeType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to scan this schedule.';
    return res.status(400).json({ error: message });
  }
});

export default router;
