import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

import scanScheduleRouter from './routes/scanSchedule';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: 'SchedUP backend' });
});

app.use(scanScheduleRouter);

app.listen(port, () => {
  console.log(`SchedUP backend listening on http://localhost:${port}`);
});
