-- Reset Habitat Game State for all users (or specifically for development)
UPDATE habitat_tree 
SET current_level = 1, 
    current_xp = 0, 
    current_streak = 0, 
    last_watered = now();
