"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const providerFactory_1 = require("../services/ai/providerFactory");
const imageValidation_1 = require("../utils/imageValidation");
const scheduleSchema_1 = require("../validators/scheduleSchema");
const router = (0, express_1.Router)();
const requestStore = new Map();
const requestBodySchema = zod_1.z.object({
    image: zod_1.z.string().min(1),
    mimeType: zod_1.z.string().optional(),
});
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
function applyRateLimit(ip) {
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
router.post('/api/scan-schedule', async (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (!applyRateLimit(clientIp)) {
        return res.status(429).json({ error: 'Too many scan requests. Please try again shortly.' });
    }
    try {
        const parsedBody = requestBodySchema.parse(req.body ?? {});
        const { validatedMimeType } = (0, imageValidation_1.validateImageFromDataUrl)(parsedBody.image, parsedBody.mimeType);
        const provider = (0, providerFactory_1.createAIProvider)();
        const rawResponse = await provider.extractScheduleFromImage(parsedBody.image);
        const validatedResponse = scheduleSchema_1.scanResponseSchema.parse(rawResponse);
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to scan this schedule.';
        return res.status(400).json({ error: message });
    }
});
exports.default = router;
