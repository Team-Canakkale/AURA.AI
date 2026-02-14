import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root, assuming the script is run from apps/backend-habit
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
// Hide full key for log
console.log('Key:', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('Fetching tasks...');
        const { data, error } = await supabase.from('habitat_tasks').select('*').limit(1);
        if (error) {
            console.error('Connection Error:', error.message);
        } else {
            console.log('Connection Successful! Found tasks:', data);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testConnection();
