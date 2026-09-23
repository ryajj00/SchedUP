"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider = void 0;
class MockProvider {
    async extractScheduleFromImage(_image) {
        return {
            courses: [
                {
                    courseName: 'Programming 1',
                    days: ['Mon', 'Wed'],
                    startTime: '09:00',
                    endTime: '10:30',
                    uncertain: false,
                    uncertaintyReason: '',
                },
                {
                    courseName: 'Mathematics',
                    days: ['Tue'],
                    startTime: '10:00',
                    endTime: '11:00',
                    uncertain: true,
                    uncertaintyReason: 'The end time is partially obscured.',
                },
            ],
        };
    }
}
exports.MockProvider = MockProvider;
