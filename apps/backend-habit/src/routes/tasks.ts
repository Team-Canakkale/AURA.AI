import express, { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Helper for sorting priorities
const PRIORITY_ORDER: Record<string, number> = {
    'big_one': 1,
    'medium': 2,
    'small': 3
};

// GET /api/habit/tasks
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        // Default to the Nil UUID (set by middleware)
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        const sortedTasks = tasks?.sort((a, b) => {
            const pA = PRIORITY_ORDER[a.priority] || 99;
            const pB = PRIORITY_ORDER[b.priority] || 99;
            return pA - pB;
        });

        res.json(sortedTasks);
    } catch (error: any) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/habit/tasks
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
        const { title, priority, status } = req.body;

        if (!title) return res.status(400).json({ error: 'Title required' });

        const newTask = {
            user_id: userId,
            title,
            priority: priority || 'medium',
            status: status || 'pending'
        };

        const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/habit/tasks/:id
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;

        // Simple update, no rigorous checks
        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: status || 'completed' // Default toggle logic simplified
            })
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const taskId = req.params.id;
        console.log(`Attempting to delete task: ${taskId}`); // DEBUG LOG

        const { error, count } = await supabase
            .from('tasks')
            .delete({ count: 'exact' }) // Request count of deleted rows
            .eq('id', taskId);

        if (error) {
            console.error('Supabase Delete Error:', error);
            throw error;
        }

        console.log(`Deleted rows count: ${count}`);

        if (count === 0) {
            // It might be already deleted or ID mismatch or RLS hidden
            console.warn(`Task ${taskId} not found or permission denied (RLS).`);
        }

        res.json({ success: true, count });
    } catch (error: any) {
        console.error('DELETE Handler Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
