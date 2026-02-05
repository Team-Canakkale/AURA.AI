import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/habit/notes
// Fetch the latest 10 notes for the user
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

        const { data, error } = await supabase
            .from('habitat_notes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching notes:', error);
            return res.status(500).json({ error: 'Failed to fetch notes' });
        }

        res.json(data);
    } catch (err) {
        console.error('Server error in GET /notes:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/habit/notes
// Create a new note entry
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const newNote = {
            user_id: userId,
            content
        };

        const { data, error } = await supabase
            .from('habitat_notes')
            .insert([newNote])
            .select()
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return res.status(500).json({ error: 'Failed to create note' });
        }

        res.status(201).json(data);
    } catch (err) {
        console.error('Server error in POST /notes:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const notesRouter = router;
