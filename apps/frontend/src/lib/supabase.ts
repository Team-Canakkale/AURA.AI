
import { createClient } from '@supabase/supabase-js';

// Hardcoded for speed as per session context
const supabaseUrl = 'https://bhczgnnrsdjgnblfkzff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoY3pnbm5yc2RqZ25ibGZremZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTkwMTMsImV4cCI6MjA4NTg3NTAxM30.Rg_USYcbYvpEXoegKpkt-j9kFR8TI-q6_0LWHHOjVss';

export const supabase = createClient(supabaseUrl, supabaseKey);
