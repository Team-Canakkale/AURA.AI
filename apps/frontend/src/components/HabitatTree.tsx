import { useState, useEffect } from 'react';
import { gamificationApi, TreeState } from '../api/habit';

interface Props {
    refreshKey: number; // Increment this to force reload
}

export default function HabitatTree({ refreshKey }: Props) {
    const [tree, setTree] = useState<TreeState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTree();
    }, [refreshKey]);

    const loadTree = async () => {
        const data = await gamificationApi.getState();
        setTree(data);
        setLoading(false);
    };

    if (loading) return <div className="glass-panel" style={{ height: '100px' }}>Loading Habitat...</div>;
    if (!tree) return null;

    const nextLevelXP = tree.current_level * 10;
    const progress = Math.min(100, (tree.current_xp / nextLevelXP) * 100);

    // Evolution Logic
    let icon = '🌱';
    let title = 'Seedling';
    if (tree.current_level >= 3) { icon = '🌿'; title = 'Sapling'; }
    if (tree.current_level >= 5) { icon = '🌳'; title = 'Young Tree'; }
    if (tree.current_level >= 10) { icon = '🍎'; title = 'Fruit Tree'; }
    if (tree.current_level >= 20) { icon = '🌳🏡'; title = 'Habitat'; }

    return (
        <div className="glass-panel habitat-tree-panel" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Left: Icon */}
            <div className="tree-icon-wrapper" style={{
                fontSize: '3rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(76, 175, 80, 0.2)'
            }}>
                {icon}
            </div>

            {/* Middle: Stats */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Lvl {tree.current_level} <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'normal' }}>{title}</span></h2>
                    <div style={{ fontSize: '0.9rem', color: '#4caf50', fontWeight: 'bold' }}>
                        {tree.current_xp} / {nextLevelXP} Water 💧
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #4caf50, #81c784)',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>

            {/* Right: Streak */}
            <div style={{ textAlign: 'center', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.5rem' }}>🔥 {tree.streak_days}</div>
                <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Streak</div>
            </div>
        </div>
    );
}
