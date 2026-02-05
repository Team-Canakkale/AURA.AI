import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());

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
    const metrics = req.body;
    res.json({
        success: true,
        metrics: { ...metrics, timestamp: new Date() }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Health service running on http://localhost:${PORT}`);
});
