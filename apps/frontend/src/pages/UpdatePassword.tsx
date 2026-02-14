import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './LoginPage.css'; // Reusing Login styles

const UpdatePassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [checkingSession, setCheckingSession] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const validateAccess = async () => {
            const { data } = await supabase.auth.getSession();
            const hasRecoveryHash = window.location.hash.includes('type=recovery');
            const hasToken = window.location.hash.includes('access_token=');

            // If we have a session AND it's a recovery link, or Supabase has already processed it
            if (data.session || hasToken) {
                if (hasRecoveryHash || hasToken) {
                    // Looks like a valid recovery flow
                    setShowForm(true);
                    setCheckingSession(false);
                } else {
                    // Logged in but not a recovery link? 
                    // To be safe, let's not show the form unless perfectly sure.
                    setError('This page is only accessible via a password reset link.');
                    setTimeout(() => navigate('/login'), 2000);
                    setCheckingSession(false);
                }
            } else {
                // No session and no token in hash
                setError('Unauthorized access. Please use the link sent to your email.');
                setTimeout(() => navigate('/login'), 2000);
                setCheckingSession(false);
            }
        };

        validateAccess();

        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            console.log("Auth Event:", event);
            if (event === 'PASSWORD_RECOVERY') {
                setShowForm(true);
                setCheckingSession(false);
                setError('');
            }
        });

        // Safety timeout
        const timer = setTimeout(() => {
            if (checkingSession) {
                setCheckingSession(false);
                if (!showForm) {
                    setError('Session verification timed out. Please try the link again.');
                    setTimeout(() => navigate('/login'), 2000);
                }
            }
        }, 3000);

        return () => {
            authListener.subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [navigate, checkingSession, showForm]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess('Password updated successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="login-container">
                <div className="login-content" style={{ justifyContent: 'center' }}>
                    <div className="upload-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-content" style={{ justifyContent: 'center' }}>
                <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Set New Password</h2>

                    <div className="auth-form">
                        {error && <div className="auth-error" style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
                        {success && <div className="auth-success" style={{ color: '#4caf50', marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(76,175,80,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{success}</div>}

                        {showForm && !success && (
                            <form onSubmit={handleUpdatePassword}>
                                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    Enter your new password below.
                                </p>
                                <div className="form-group">
                                    <label htmlFor="new-password">New Password</label>
                                    <input
                                        type="password"
                                        id="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                        minLength={6}
                                        disabled={loading}
                                    />
                                </div>

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="submit-btn"
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', marginTop: '0.5rem', boxShadow: 'none' }}
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
