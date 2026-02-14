import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HealthNavbar.css';

export default function HealthNavbar() {
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
        <nav className="health-navbar" ref={navRef}>
            <div className="health-nav-container">
                <Link to="/" className="health-logo">
                    <span className="health-icon">🩸</span>
                    <span className="health-title">AURA Health</span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ⋮
                </button>

                <div className={`health-nav-actions ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/profile" className="nav-back-btn" style={{ marginRight: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>👤</span> Profile
                    </Link>

                    <Link to="/" className="nav-back-btn">
                        ← Home
                    </Link>

                    <button
                        className="logout-btn"
                        onClick={() => {
                            localStorage.clear();
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
