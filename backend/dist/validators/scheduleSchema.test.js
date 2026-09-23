"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const scheduleSchema_1 = require("./scheduleSchema");
(0, node_test_1.default)('accepts valid scanned course payloads', () => {
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
    strict_1.default.doesNotThrow(() => scheduleSchema_1.scanResponseSchema.parse(payload));
});
(0, node_test_1.default)('rejects end time before start time', () => {
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
    strict_1.default.throws(() => scheduleSchema_1.scanResponseSchema.parse(payload));
});
