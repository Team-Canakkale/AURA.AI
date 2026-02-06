import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './LoginPage.css';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
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
                    localStorage.setItem('sb-access-token', data.session.access_token);
                    navigate('/');
                }
            } else {
                // Sign Up Logic
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name }
                    }
                });

                if (error) throw error;
                setError('Check your email for confirmation link!');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        localStorage.setItem('sb-access-token', 'DEMO_TOKEN');
        navigate('/');
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <div className="login-content">
                <div className="login-header">
                    <h1>Aura AI</h1>
                    <p>Your Personal AI Ecosystem</p>
                </div>

                <div className="glass-card">
                    <div className="auth-tabs">
                        <button
                            className={`tab ${isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(true); setError(''); }}
                        >
                            Login
                        </button>
                        <button
                            className={`tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(false); setError(''); }}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-error" style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px', whiteSpace: 'pre-line' }}>{error}</div>}

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
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

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
                </div>
            </div>
        </div>
    );
};

export default Login;
