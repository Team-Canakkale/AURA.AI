-- Add status column to habitat_events
ALTER TABLE habitat_events 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update existing rows to have 'pending' status
UPDATE habitat_events SET status = 'pending' WHERE status IS NULL;
