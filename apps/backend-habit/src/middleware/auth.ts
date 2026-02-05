import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    // BYPASS AUTHENTICATION COMPLETELY - STUPID MODE
    // We use a valid UUID (Nil UUID) to satisfy Postgres 'uuid' type check
    req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'bypass@aura.ai' };
    next();
};
