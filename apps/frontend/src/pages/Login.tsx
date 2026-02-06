import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Save token
            if (data.session) {
                localStorage.setItem('sb-access-token', data.session.access_token);
                navigate('/habitat');
            }
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError('');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setError('Check your email for confirmation link! (Or if auto-confirm is on, just Login)');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="glass-panel login-box">
                <h1>🔐 Aura AI Access</h1>
                <p>Login to access Task Manager</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Processing...' : 'Login'}
                    </button>
                    <button type="button" onClick={() => {
                        localStorage.setItem('sb-access-token', 'DEMO_TOKEN');
                        navigate('/habitat');
                    }} className="demo-btn">
                        🚀 Demo Giriş (Hızlı)
                    </button>
                    <button type="button" onClick={handleSignUp} className="signup-btn">
                        Sign Up
                    </button>
                </form>
            </div>

            <style>{`
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: radial-gradient(circle at top left, #2a2a72, #009ffd);
                }
                .login-box {
                    padding: 3rem;
                    width: 400px;
                    text-align: center;
                    border-radius: 24px;
                }
                .login-box h1 { margin-bottom: 0.5rem; }
                .login-box p { color: rgba(255,255,255,0.7); margin-bottom: 2rem; }
                input {
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 1rem;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(0,0,0,0.2);
                    color: white;
                }
                .login-btn {
                    width: 100%;
                    padding: 12px;
                    background: #00bf8f;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 1rem;
                }
                .demo-btn {
                    width: 100%;
                    padding: 12px;
                    background: #575fcf;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 1rem;
                }
                .signup-btn {
                    background: transparent;
                    color: rgba(255,255,255,0.7);
                    border: none;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .error-msg {
                    background: rgba(255, 71, 87, 0.2);
                    color: #ff4757;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
}
