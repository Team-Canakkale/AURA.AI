import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './LoginPage.css';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleForgotPassword = async (e: React.FormEvent) => {
        // ... (truncated for brevity, keep existing logic)
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;
            setSuccess('Password reset link sent to your email!');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login Logic
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.session) {
                    sessionStorage.setItem('sb-access-token', data.session.access_token);
                    navigate('/');
                }
            } else {
                // Sign Up Logic
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match!");
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name }
                    }
                });

                if (error) throw error;

                if (data.session) {
                    sessionStorage.setItem('sb-access-token', data.session.access_token);
                    navigate('/');
                } else {
                    setSuccess('Please check your email for the confirmation link before logging in.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        sessionStorage.setItem('sb-access-token', 'DEMO_TOKEN');
        navigate('/');
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-header">
                    <div className="logo-container">
                        <div className="login-background" />
                        <div className="lumi-wrapper">
                            <img src="/lumi_v2.png" alt="Lumi Mascot" className="lumi-img-v2" />
                        </div>
                        <h1 className="aura-logo">
                            <span className="aura-text">AURA.AI</span>
                        </h1>
                    </div>
                    <p className="login-slogan">Level up your aura</p>
                </div>

                <div className="glass-card">
                    {!isForgotPassword ? (
                        <>
                            <div className="auth-tabs">
                                <div className={`tab-indicator ${isLogin ? 'login' : 'register'}`} />
                                <button
                                    className={`tab ${isLogin ? 'active' : ''}`}
                                    onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                                >
                                    Login
                                </button>
                                <button
                                    className={`tab ${!isLogin ? 'active' : ''}`}
                                    onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                                >
                                    Register
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="auth-form">
                                {error && <div className="auth-error" style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px', whiteSpace: 'pre-line' }}>{error}</div>}
                                {success && <div className="auth-success" style={{ color: '#4caf50', marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(76,175,80,0.1)', padding: '0.5rem', borderRadius: '4px', whiteSpace: 'pre-line' }}>{success}</div>}

                                {!isLogin && (
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label htmlFor="password">Password</label>
                                        {isLogin && (
                                            <span
                                                onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                                                style={{ fontSize: '0.8rem', color: '#00d2ff', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                Forgot?
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirm Password</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required={!isLogin}
                                            minLength={6}
                                        />
                                    </div>
                                )}

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                                </button>

                                {isLogin && (
                                    <button type="button" onClick={handleDemoLogin} className="submit-btn" style={{ background: 'rgba(255,255,255,0.1)', marginTop: '0.5rem', boxShadow: 'none' }}>
                                        🚀 Demo Login
                                    </button>
                                )}
                            </form>

                            <div className="auth-footer">
                                {isLogin ? (
                                    <p>Don't have an account? <span onClick={() => { setIsLogin(false); setError(''); }}>Sign up</span></p>
                                ) : (
                                    <p>Already have an account? <span onClick={() => { setIsLogin(true); setError(''); }}>Sign in</span></p>
                                )}
                            </div>
                        </>
                    ) : (
                        // Forgot Password View
                        <>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Reset Password</h2>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                Enter your email to receive a password reset link.
                            </p>

                            <form onSubmit={handleForgotPassword} className="auth-form">
                                {error && <div className="auth-error" style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
                                {success && <div className="auth-success" style={{ color: '#4caf50', marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(76,175,80,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{success}</div>}

                                <div className="form-group">
                                    <label htmlFor="reset-email">Email Address</label>
                                    <input
                                        type="email"
                                        id="reset-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
                                    className="submit-btn"
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', marginTop: '0.5rem', boxShadow: 'none' }}
                                >
                                    Back to Login
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
