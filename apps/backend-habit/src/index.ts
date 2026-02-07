import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import tasksRouter from './routes/tasks';
import eventsRouter from './routes/events';
import { notesRouter } from './routes/notes';
import { gamificationRouter } from './routes/gamification';
import { aiRouter } from './routes/ai';
import { callRouter } from './routes/call';
import { supabase } from './lib/supabase';
import { getGeminiModel } from './lib/gemini';

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
app.use('/ai', aiRouter);
app.use('/call', callRouter);

// Legacy/Simple Habit Routes (Keep for compatibility if frontend uses them)
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
        habit: { id: Date.now(), name, frequency, entries: [] }
    });
});

// Supabase Test Endpoint
app.get('/test-supabase', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('test_table').select('*').limit(1);
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Gemini Test Endpoint
app.post('/test-ai', async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        // Try using Gemini if configured, otherwise fallback to simple response
        try {
            const model = getGeminiModel();
            const result = await model.generateContent(prompt || 'Hello!');
            const response = await result.response;
            res.json({ success: true, text: response.text(), source: 'Gemini' });
        } catch (geminiError) {
            console.warn('Gemini error, falling back to mock:', geminiError);
            res.json({
                text: `Based on your prompt "${prompt}", I suggest keeping consistent! (AI Backend Ready - Fallback)`,
                source: 'Mock'
            });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Habit service running on http://localhost:${PORT}`);
});
