import { useState, useEffect, useRef } from 'react';
import { gamificationApi, TreeState } from '../api/habit';
import '../App.css';

interface Props {
    refreshKey: number; // Increment this to force reload
}

export default function HabitatTree({ refreshKey }: Props) {
    const [tree, setTree] = useState<TreeState | null>(null);
    const [loading, setLoading] = useState(true);
    const [showWater, setShowWater] = useState(false);
    const prevXPRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const data = await gamificationApi.getState();
                setTree(data);

                if (data) {
                    // Animasyon Tetikleyici:
                    // İlk yükleme değilse (prevXP null değilse) VE XP arttıysa
                    if (prevXPRef.current !== null && data.current_xp > prevXPRef.current) {
                        setShowWater(true);
                        setTimeout(() => setShowWater(false), 1500);
                    }

                    // Mevcut XP'yi kaydet
                    prevXPRef.current = data.current_xp;
                }

            } catch (error) {
                console.error('Error fetching tree:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTree();
    }, [refreshKey]);

    if (loading) return <div className="glass-panel">Loading habitat...</div>;
    if (!tree) return null;

    const nextLevelXP = tree.current_level * 10;
    const progress = Math.min(100, (tree.current_xp / nextLevelXP) * 100);

    // Evolution Logic (Emojis)
    let icon = '🌱';
    let title = 'Seedling';
    if (tree.current_level >= 3) { icon = '🌿'; title = 'Sapling'; }
    if (tree.current_level >= 5) { icon = '🌳'; title = 'Young Tree'; }
    if (tree.current_level >= 10) { icon = '🍎'; title = 'Fruit Tree'; }
    if (tree.current_level >= 20) { icon = '🌳🏡'; title = 'Habitat'; }

    return (
        <div className="glass-panel habitat-tree-panel" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute', top: '-50%', left: '-20%', width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(76, 175, 80, 0.15) 0%, rgba(0,0,0,0) 70%)',
                zIndex: 0, pointerEvents: 'none'
            }} />

            {/* Water Drop Animation */}
            {showWater && <div className="water-drop">💧</div>}

            {/* Left: Icon */}
            <div className="tree-icon-wrapper" style={{
                zIndex: 1,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s ease'
            }}>
                <span style={{ fontSize: '3rem', display: 'inline-block', filter: 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.3))' }}>
                    {icon}
                </span>
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
