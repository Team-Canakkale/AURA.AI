import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import OpenAI from 'openai';
import dotenv from 'dotenv'; // Ensure dotenv is used

dotenv.config();

const router = Router();

// Initialize OpenAI
// Note: Ensure OPENAI_API_KEY is in your .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/habit/ai/mood
// Analyze recent notes for burnout/stress
router.post('/mood', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

        // 1. Fetch recent notes (Limit 10)
        const { data: notes, error } = await supabase
            .from('habitat_notes')
            .select('content')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        // 2. Handle empty notes
        if (!notes || notes.length === 0) {
            return res.json({
                mood: 'Neutral',
                score: 5,
                advice: 'No notes to analyze yet. Write something down so I can analyze you! 📝'
            });
        }

        // 3. Prepare Prompt
        const notesText = notes.map(n => n.content).join('\n---\n');

        // 4. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are 'Aura', an empathetic AI productivity coach. Analyze these notes. Return a JSON object ONLY: { mood: 'string (English)', score: number (1-10, where 10 is high energy/happy), advice: 'string (English, max 2 sentences, encouraging)' }."
                },
                {
                    role: "user",
                    content: notesText
                }
            ],
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');

        // 5. Return Result
        res.json(result);

    } catch (err: any) {
        console.error('Error in AI Mood Analysis:', err);

        // Handle missing API key gracefully
        if (err.status === 401) {
            return res.status(500).json({ error: 'OpenAI API key missing or invalid.' });
        }

        res.status(500).json({ error: 'AI analysis failed' });
    }
});

export const aiRouter = router;
