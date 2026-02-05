import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import tasksRouter from './routes/tasks';
import eventsRouter from './routes/events';
import { notesRouter } from './routes/notes';
import { gamificationRouter } from './routes/gamification';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'habit',
        timestamp: new Date().toISOString()
    });
});

// Routes
// Frontend: /api/habit/tasks -> Proxy -> Backend: /tasks
app.use('/tasks', tasksRouter);
app.use('/events', eventsRouter);
app.use('/notes', notesRouter);
app.use('/gamification', gamificationRouter);

// Legacy/Simple Habit Routes (Keep for compatibility if frontend uses them)
// Ideally, habits should also be in a dedicated router
app.get('/habits', (req: Request, res: Response) => {
    res.json({
        habits: [
            { id: 1, name: 'Morning Exercise', streak: 7, completed: true },
            { id: 2, name: 'Read 20 pages', streak: 3, completed: false }
        ]
    });
});

app.post('/habits', (req: Request, res: Response) => {
    const { name, frequency } = req.body;
    res.json({
        success: true,
        habit: { id: Date.now(), name, frequency, streak: 0, completed: false }
    });
});

// AI Test Endpoint (For Habit Coach)
app.post('/test-ai', (req: Request, res: Response) => {
    const { prompt } = req.body;
    // Mock response for now or connect to Gemini if lib exists
    res.json({
        text: `Based on your prompt "${prompt}", I suggest keeping consistent! (AI Backend Ready)`
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Habit service running on http://localhost:${PORT}`);
});
