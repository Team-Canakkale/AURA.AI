
import { supabase } from '../src/lib/supabase';

async function resetGame() {
    console.log('🔄 Resetting habitat_tree for all users...');

    // Equivalent to: UPDATE habitat_tree SET current_level=1, current_xp=0, streak_days=0, last_watered_at=now();
    const { data, error } = await supabase
        .from('habitat_tree')
        .update({
            current_level: 1,
            current_xp: 0,
            streak_days: 0,
            last_watered_at: new Date().toISOString()
        })
        .gte('current_level', 0); // Update all rows where level >= 0 (which should be all)

    if (error) {
        console.error('❌ Error resetting game:', error.message);
        process.exit(1);
    } else {
        console.log('✅ Game reset successfully for ALL users.');
    }
}

resetGame();
