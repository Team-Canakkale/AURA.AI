-- Add location column (previous step)
ALTER TABLE habitat_events ADD COLUMN IF NOT EXISTS location text;

-- Add end_date column for time range support
ALTER TABLE habitat_events ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;
