import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// Helper: Calculate XP required for next level
const getNextLevelThreshold = (level: number) => {
    return level * 10; // Level 1->2 needs 10xp, 2->3 needs 20xp...
};

// GET /api/habit/gamification
// Fetch current tree state
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

        let { data, error } = await supabase
            .from('habitat_tree')
            .select('*')
            .eq('user_id', userId)
            .single();

        // If no tree exists, create one
        if (!data) {
            const newTree = {
                user_id: userId,
                current_xp: 0,
                current_level: 1,
                streak_days: 0,
                last_watered_at: new Date().toISOString()
            };
            const createRes = await supabase.from('habitat_tree').insert([newTree]).select().single();
            data = createRes.data;
        }

        res.json(data);
    } catch (err) {
        console.error('Error in GET /gamification:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/habit/gamification/action
// Trigger an action (login, task, event)
router.post('/action', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
        const { action, eventType } = req.body; // action: 'login' | 'task_complete' | 'event_attended'

        // 1. Get current state
        let { data: tree } = await supabase
            .from('habitat_tree')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!tree) {
            // Create if not exists
            const newTree = { user_id: userId, current_xp: 0, current_level: 1, streak_days: 0 };
            const createRes = await supabase.from('habitat_tree').insert([newTree]).select().single();
            tree = createRes.data;
        }

        let xpGained = 0;
        let message = '';
        const now = new Date();
        const lastWatered = new Date(tree.last_watered_at);
        const diffHours = (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60);

        // --- LOGIC ENGINE ---

        // A. LOGIN RULE
        if (action === 'login') {
            // Check Penalty first: If > 48h since last water, subtract XP
            if (diffHours > 48) {
                tree.current_xp = Math.max(0, tree.current_xp - 3);
                tree.streak_days = 0;
                message = 'Uzun süre girmedin! Ağaç kuruyor (-3 Su).';
            }

            // Daily Login Reward (Once per 18h to be safe)
            if (diffHours > 18) {
                xpGained = 1;
                tree.streak_days += 1;
                message = 'Günlük giriş bonusu! (+1 Su)';
            } else {
                message = 'Bugün zaten suladın.';
            }
        }

        // B. TASK RULE
        else if (action === 'task_complete') {
            xpGained = 2; // Fixed 2 XP per task
            message = 'Görev tamamlandı! (+2 Su)';
        }

        // C. EVENT RULE
        else if (action === 'event_attended') {
            if (eventType?.toLowerCase().includes('hackathon')) {
                xpGained = 10;
                message = 'Hackathon katılımı! (+10 Su)';
            } else if (eventType?.toLowerCase().includes('staj')) {
                xpGained = 3;
                message = 'Staj günü! (+3 Su)';
            } else {
                xpGained = 1; // Standard event
                message = 'Etkinlik tamamlandı! (+1 Su)';
            }
        }

        // --- UPDATE STATE ---
        tree.current_xp += xpGained;

        // Level Up Check
        let leveledUp = false;
        const threshold = getNextLevelThreshold(tree.current_level);

        if (tree.current_xp >= threshold) {
            tree.current_xp -= threshold; // Carry over overflow XP
            tree.current_level += 1;
            leveledUp = true;
            message += ` TEBRİKLER! SEVİYE ${tree.current_level} OLDUN! 🌳`;
        }

        // Save to DB
        const { data: updatedTree, error } = await supabase
            .from('habitat_tree')
            .update({
                current_xp: tree.current_xp,
                current_level: tree.current_level,
                streak_days: tree.streak_days,
                last_watered_at: new Date().toISOString()
            })
            .eq('id', tree.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            tree: updatedTree,
            xpGained,
            leveledUp,
            message
        });

    } catch (err) {
        console.error('Error in POST /gamification/action:', err);
        res.status(500).json({ error: 'Gamification engine failed' });
    }
});

export const gamificationRouter = router;
