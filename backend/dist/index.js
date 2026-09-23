"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const scanSchedule_1 = __importDefault(require("./routes/scanSchedule"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 3000);
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'SchedUP backend' });
});
app.use(scanSchedule_1.default);
app.listen(port, () => {
    console.log(`SchedUP backend listening on http://localhost:${port}`);
});
