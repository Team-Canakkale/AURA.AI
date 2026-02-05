import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env', override: false }); // Look for root .env, but don't overwrite

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase URL or Key is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
