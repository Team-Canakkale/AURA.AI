import React, { useState } from 'react';
import './LoginPage.css';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            // Mock Validation (Case Sensitive)
            if (email === 'demo@aura.ai' && password === 'Password123') {
                console.log('Login successful');
                onLogin();
            } else {
                setError('Invalid email or password.\n  (Try: demo@aura.ai / Password123)');
            }
        } else {
            // Mock Register
            if (email && password && name) {
                console.log('Registration successful:', { email, name });
                onLogin();
            } else {
                setError('Please fill in all fields.');
            }
        }
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
                            onClick={() => setIsLogin(true)}
                        >
                            Login
                        </button>
                        <button
                            className={`tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(false)}
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

                        <button type="submit" className="submit-btn" onClick={handleSubmit}>
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        {isLogin ? (
                            <p>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign up</span></p>
                        ) : (
                            <p>Already have an account? <span onClick={() => setIsLogin(true)}>Sign in</span></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
