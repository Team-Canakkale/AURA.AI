-- Create table for Habitat Tree Gamification
CREATE TABLE IF NOT EXISTS habitat_tree (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL, 
  current_xp int DEFAULT 0,       -- Mevcut Su/Puan
  current_level int DEFAULT 1,    -- Seviye (1: Tohum, 2: Fidan...)
  last_watered_at timestamp with time zone DEFAULT timezone('utc'::text, now()), -- Son puan kazanma zamanı
  streak_days int DEFAULT 0,      -- Kaç gündür üst üste giriyor
  tree_type text DEFAULT 'oak',   -- İleride farklı ağaç türleri seçebilsin diye
  CONSTRAINT unique_user_tree UNIQUE (user_id)
);

-- Disable RLS for compatibility
ALTER TABLE habitat_tree DISABLE ROW LEVEL SECURITY;
