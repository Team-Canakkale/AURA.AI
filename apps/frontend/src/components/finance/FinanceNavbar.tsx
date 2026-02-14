import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './FinanceNavbar.css';

interface FinanceNavbarProps {
    onChatToggle: () => void;
}

export default function FinanceNavbar({ onChatToggle }: FinanceNavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="finance-navbar" ref={navRef}>
            <div className="finance-nav-container">
                <Link to="/" className="finance-logo">
                    <span className="squirrel-icon">🐿️</span>
                    <span className="finance-title">TUSU Finance</span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ⋮
                </button>

                <div className={`finance-nav-actions ${isMenuOpen ? 'open' : ''}`}>
                    <button
                        className="chat-toggle-btn"
                        onClick={() => {
                            setIsMenuOpen(false); // Close menu on action
                            onChatToggle();
                        }}
                    >
                        <span className="chat-icon">💬</span>
                        Chat with TUSU
                    </button>

                    <Link to="/profile" className="nav-back-btn" style={{ marginRight: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>👤</span> Profile
                    </Link>

                    <Link to="/" className="nav-back-btn">
                        ← Home
                    </Link>

                    <button
                        className="logout-btn"
                        onClick={() => {
                            sessionStorage.clear();
                            window.location.href = '/';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
