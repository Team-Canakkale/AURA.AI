-- Reset Habitat Game State (Corrected Column Names)
UPDATE habitat_tree 
SET current_level = 1, 
    current_xp = 0, 
    streak_days = 0, 
    last_watered_at = now();
