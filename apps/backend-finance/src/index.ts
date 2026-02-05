import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'finance',
        timestamp: new Date().toISOString()
    });
});

// Sample finance endpoints
app.get('/transactions', (req: Request, res: Response) => {
    res.json({
        transactions: [
            { id: 1, amount: 100, description: 'Sample transaction', date: new Date() }
        ]
    });
});

app.post('/transactions', (req: Request, res: Response) => {
    const { amount, description } = req.body;
    res.json({
        success: true,
        transaction: { id: Date.now(), amount, description, date: new Date() }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Finance service running on http://localhost:${PORT}`);
});
