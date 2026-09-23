"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanResponseSchema = exports.scannedCourseSchema = exports.DayEnum = void 0;
const zod_1 = require("zod");
exports.DayEnum = zod_1.z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
exports.scannedCourseSchema = zod_1.z.object({
    courseName: zod_1.z.string().trim().min(1, 'Course name is required.'),
    days: zod_1.z.array(exports.DayEnum).min(1, 'At least one day is required.'),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    uncertain: zod_1.z.boolean().default(false),
    uncertaintyReason: zod_1.z.string().optional(),
}).refine((course) => {
    const startMinutes = Number(course.startTime.split(':')[0]) * 60 + Number(course.startTime.split(':')[1]);
    const endMinutes = Number(course.endTime.split(':')[0]) * 60 + Number(course.endTime.split(':')[1]);
    return endMinutes > startMinutes;
}, {
    message: 'endTime must be later than startTime.',
    path: ['endTime'],
});
exports.scanResponseSchema = zod_1.z.object({
    courses: zod_1.z.array(exports.scannedCourseSchema),
});
