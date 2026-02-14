import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Reuse global styles

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUser(data.user);
            } else {
                // Should be redirected by ProtectedRoute
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        sessionStorage.removeItem('sb-access-token');
        navigate('/login');
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            Loading...
        </div>
    );

    return (
        <div className="profile-page" style={{
            minHeight: '100vh',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Inter, sans-serif',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background from App.css (Blue/Ocean Theme) */}
            <div className="ocean-background" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '150vw',
                height: '150vh',
                background: 'radial-gradient(circle closest-side, rgba(0, 100, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '2.5rem',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}>
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                    margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3.5rem', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    👤
                </div>

                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
                    {user?.user_metadata?.full_name || 'Aura User'}
                </h1>
                <p style={{ color: '#888', margin: '0 0 2rem 0' }}>{user?.email}</p>

                <div className="profile-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Member Since</div>
                        <div style={{ fontWeight: 'bold' }}>{new Date(user?.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Status</div>
                        <div style={{ color: '#4caf50', fontWeight: 'bold' }}>Active</div>
                    </div>
                </div>

                <div className="profile-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} style={{
                        padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: 'white', cursor: 'pointer', transition: 'background 0.2s',
                        fontSize: '1rem', fontWeight: '500'
                    }}>
                        ← Back to Dashboard
                    </button>

                    <button onClick={handleLogout} style={{
                        padding: '1rem', borderRadius: '12px', border: 'none',
                        background: 'rgba(244, 67, 54, 0.15)', color: '#f44336',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                        transition: 'background 0.2s'
                    }}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
