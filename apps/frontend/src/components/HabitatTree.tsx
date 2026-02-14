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
                    if (prevXPRef.current !== null && data.current_xp > prevXPRef.current) {
                        setShowWater(true);
                        setTimeout(() => setShowWater(false), 1500);
                    }
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
        <div className="glass-panel habitat-tree-panel" style={{
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column', // Dikey yerleşim
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '300px' // Biraz yükseklik verelim
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px',
                background: 'radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, rgba(0,0,0,0) 70%)',
                zIndex: 0, pointerEvents: 'none'
            }} />

            {/* Water Drop Animation */}
            {showWater && <div className="water-drop" style={{
                position: 'absolute', top: '20%', right: '20%', fontSize: '2rem', animation: 'drop 1s ease infinite'
            }}>💧</div>}

            {/* TOP: Big Icon */}
            <div className="tree-icon-wrapper" style={{
                zIndex: 1,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
                width: '120px', // Daha büyük
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s ease'
            }}>
                <span style={{ fontSize: '4.5rem', display: 'inline-block', filter: 'drop-shadow(0 0 15px rgba(76, 175, 80, 0.4))' }}>
                    {icon}
                </span>
            </div>

            {/* MIDDLE: Level Info & Bar */}
            <div style={{ width: '100%', textAlign: 'center', zIndex: 1 }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', color: '#fff', fontWeight: '800' }}>
                    Lvl {tree.current_level} <span style={{ fontSize: '1.1rem', color: '#888', fontWeight: '500', marginLeft: '5px' }}>{title}</span>
                </h2>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    fontSize: '0.9rem',
                    color: '#4caf50',
                    fontWeight: 'bold',
                    marginBottom: '0.8rem'
                }}>
                    <span>{tree.current_xp} / {nextLevelXP} Water</span>
                    <span>💧</span>
                </div>

                {/* Progress Bar Container */}
                <div style={{
                    width: '100%',
                    height: '10px', // Biraz daha kalın
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #4caf50, #81c784)',
                        boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
                        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                </div>
            </div>

            {/* BOTTOM: Streak */}
            <div style={{
                marginTop: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '2px'
            }}>
                <div style={{ fontSize: '2rem', lineHeight: 1 }}>🔥 {tree.streak_days}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Day Streak</div>
            </div>
        </div>
    );
}
