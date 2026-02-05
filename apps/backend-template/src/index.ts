import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004; // Change this to next available port

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (Required for frontend monitoring!)
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'template', // Change this to your service name
        timestamp: new Date().toISOString()
    });
});

// ============================================
// Add your API endpoints below this line
// ============================================

// Example GET endpoint
app.get('/api/example', (req: Request, res: Response) => {
    res.json({
        message: 'This is an example endpoint',
        data: {
            example: 'value'
        }
    });
});

// Example POST endpoint
app.post('/api/example', (req: Request, res: Response) => {
    const { data } = req.body;

    // Validate input
    if (!data) {
        return res.status(400).json({
            error: 'Missing required field: data'
        });
    }

    // Process and return
    res.status(201).json({
        success: true,
        message: 'Data created successfully',
        data: {
            id: Date.now(),
            data,
            createdAt: new Date().toISOString()
        }
    });
});

// ============================================
// Start server
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Template service running on http://localhost:${PORT}`);
    console.log(`📝 Remember to change the service name and port!`);
});
