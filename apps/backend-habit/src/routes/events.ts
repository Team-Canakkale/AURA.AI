import express, { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// GET /api/habit/events - List future events
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: events, error } = await supabase
            .from('habitat_events')
            .select('*')
            //.eq('user_id', userId) // Optional: filter by user if we wanted strictness. In bypass, we might skip or keep it.
            /* 
               If we are in bypass mode (all users use the same dummy ID), filtering by ID is fine.
               But if RLS is off and user_id is random, we might miss things.
               Let's filter by user_id to keep some semblance of order if multiple dummy users exist,
               or just show ALL events if we want a shared calendar.
               Given previous task behavior, let's filter by the userId we have in context.
            */
            .eq('user_id', userId)
            .gte('event_date', today.toISOString()) // Future events only
            .order('event_date', { ascending: true }); // Nearest first

        if (error) throw error;

        res.json(events);
    } catch (error: any) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/habit/events - Add Event
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
        const { title, event_date, type } = req.body;

        if (!title || !event_date || !type) {
            return res.status(400).json({ error: 'Missing required fields: title, event_date, type' });
        }

        const newEvent = {
            user_id: userId,
            title,
            event_date,
            type
        };

        const { data, error } = await supabase
            .from('habitat_events')
            .insert([newEvent])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/habit/events/:id - Delete Event
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const eventId = req.params.id;
        console.log(`Attempting to delete event: ${eventId}`);

        const { error, count } = await supabase
            .from('habitat_events')
            .delete({ count: 'exact' })
            .eq('id', eventId);

        if (error) throw error;

        if (count === 0) {
            console.warn(`Event ${eventId} not found or could not be deleted.`);
        }

        res.json({ success: true, count });
    } catch (error: any) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
