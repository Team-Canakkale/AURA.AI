import { Router, Request, Response } from 'express';
import fetch from 'node-fetch'; // or verify if fetch is globally available in Node 18+ (it is, but tsconfig might need update)
// Using native fetch if on Node 18+, otherwise need node-fetch. Assuming native fetch or axios.
// Let's use axios since it's in package.json dependencies.
import axios from 'axios';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const apiKey = process.env.VAPI_PRIVATE_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    const customerNumber = process.env.MY_MOBILE_NUMBER;

    if (!apiKey || !assistantId || !phoneNumberId || !customerNumber) {
        return res.status(500).json({ error: 'Missing environment variables' });
    }

    try {
        const response = await axios.post('https://api.vapi.ai/call', {
            phoneNumberId: phoneNumberId,
            customer: {
                number: customerNumber,
            },
            assistantId: assistantId,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        res.json({ success: true, data: response.data });
    } catch (error: any) {
        console.error('API Route Error:', error?.response?.data || error.message);
        res.status(error?.response?.status || 500).json({
            error: error?.response?.data?.message || 'Failed to trigger call'
        });
    }
});

export const callRouter = router;
