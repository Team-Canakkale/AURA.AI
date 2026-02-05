-- Create table for Brain Dump / Quick Notes
CREATE TABLE IF NOT EXISTS habitat_notes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL, -- In bypass mode, this might be a dummy ID
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for compatibility with current bypass mode (as requested in previous sessions)
ALTER TABLE habitat_notes DISABLE ROW LEVEL SECURITY;
