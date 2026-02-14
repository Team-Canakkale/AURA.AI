import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HabitatNavbar.css';

interface HabitatNavbarProps {
    tree: any;
    QuickNotesComponent: React.ReactNode;
}

export default function HabitatNavbar({ tree, QuickNotesComponent }: HabitatNavbarProps) {
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
        <nav className="habitat-navbar" ref={navRef}>
            <div className="habitat-nav-container">
                <Link to="/" className="habitat-logo">
                    <span className="habitat-icon">🌿</span>
                    <span className="habitat-title">AURA Habit</span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ⋮
                </button>

                <div className={`habitat-nav-actions ${isMenuOpen ? 'open' : ''}`}>
                    {tree && (
                        <div className="token-stats">
                            <span>💧 {tree.current_xp} Water</span>
                            <span>⭐ Lvl {tree.current_level}</span>
                        </div>
                    )}
                    {QuickNotesComponent}
                    <Link to="/" className="nav-back-btn">
                        ← Home
                    </Link>
                    <Link to="/profile" className="nav-back-btn" style={{ marginRight: '0.5rem' }}>
                        👤 Profile
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
