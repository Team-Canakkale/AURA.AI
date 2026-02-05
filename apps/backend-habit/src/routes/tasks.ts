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

// GET /api/habitat/tasks - Fetch tasks for authenticated user
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User ID missing' });
        }

        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        // Sort tasks in JS as requested: big_one > medium > small
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

// POST /api/habitat/tasks - Create a new task
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { title, priority, status } = req.body;

        // Validation
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newTask = {
            user_id: userId,
            title,
            priority: priority || 'medium', // Default to medium
            status: status || 'pending'
        };

        const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/habitat/tasks/:id - Toggle status
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;
        const { status } = req.body; // Can accept generic status update or toggle logic if needed

        // If status is provided, use it. If not, fetch and toggle? 
        // Requirement says: "Toggle status ('pending' <-> 'completed')"

        // First, verify ownership and get current status
        const { data: task, error: fetchError } = await supabase
            .from('tasks')
            .select('status')
            .eq('id', taskId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !task) {
            return res.status(404).json({ error: 'Task not found or permission denied' });
        }

        // Determine new status
        let newStatus = status;
        if (!newStatus) {
            newStatus = task.status === 'completed' ? 'pending' : 'completed';
        }

        const { data: updatedTask, error: updateError } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId)
            .eq('user_id', userId) // Security check double-down
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        res.json(updatedTask);
    } catch (error: any) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/habitat/tasks/:id - Delete task
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;

        // Supabase RLS (Row Level Security) is best, but we'll enforce here too
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)
            .eq('user_id', userId); // Ensure user deletes their own task

        if (error) {
            // If row doesn't exist, Supabase delete might not return error but count 0.
            // We often consider delete success even if idempotency is applied.
            throw error;
        }

        // We could check count here if we wanted to return 404 if nothing was deleted.
        // For now, 200 OK.
        res.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
