import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './lib/supabase';
import { getGeminiModel } from './lib/gemini';

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'habit',
        timestamp: new Date().toISOString()
    });
});

// Sample habit endpoints
app.get('/habits', (req: Request, res: Response) => {
    res.json({
        habits: [
            { id: 1, name: 'Morning Exercise', streak: 7, completed: true }
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
        const model = getGeminiModel();
        const result = await model.generateContent(prompt || 'Hello!');
        const response = await result.response;
        res.json({ success: true, text: response.text() });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Habit service running on http://localhost:${PORT}`);
});
