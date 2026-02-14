
import { createClient } from '@supabase/supabase-js';

// Hardcoded for speed as per session context
const supabaseUrl = 'https://sfrgyuvwjcpzssrogofn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcmd5dXZ3amNwenNzcm9nb2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc2ODksImV4cCI6MjA4NjYzMzY4OX0.J-yM5JhZRwertcIWkt4UZD8pxhnONDRjYhmV_H6rIAw';

export const supabase = createClient(supabaseUrl, supabaseKey);
