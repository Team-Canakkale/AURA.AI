import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './lib/supabase';
import { getGeminiModel } from './lib/gemini';
import healthRoutes from './routes/healthRoutes';

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(healthRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'health',
        timestamp: new Date().toISOString()
    });
});

// Sample health endpoints
app.get('/metrics', (req: Request, res: Response) => {
    res.json({
        metrics: {
            steps: 8500,
            calories: 2100,
            sleep: 7.5,
            water: 2.0
        }
    });
});

app.post('/metrics', (req: Request, res: Response) => {
    const { type, value, unit } = req.body;
    res.json({
        success: true,
        metric: { id: Date.now(), type, value, unit, timestamp: new Date() }
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
    console.log(`🚀 Health service running on http://localhost:${PORT}`);
});
