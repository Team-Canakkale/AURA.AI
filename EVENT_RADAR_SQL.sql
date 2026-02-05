-- Create the EVENTS table for Event Radar
create table habitat_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- Keeping it loose/nullable for bypass mode compatibility
  title text not null check (char_length(title) > 0),
  event_date timestamp with time zone not null,
  type text not null, -- e.g. 'hackathon', 'exam', 'meeting'
  created_at timestamp with time zone default now()
);

-- Disable RLS for easiest access (matches current 'Stupid/Bypass Mode')
ALTER TABLE habitat_events DISABLE ROW LEVEL SECURITY;

-- If you want to enable it later, you can add policies.
-- For now, this table is open for the backend to read/write freely.
