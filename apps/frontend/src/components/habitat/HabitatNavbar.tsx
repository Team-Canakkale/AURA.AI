import { Link } from 'react-router-dom';
import './HabitatNavbar.css';

interface HabitatNavbarProps {
    tree: any;
    QuickNotesComponent: React.ReactNode;
}

export default function HabitatNavbar({ tree, QuickNotesComponent }: HabitatNavbarProps) {
    return (
        <nav className="habitat-navbar">
            <div className="habitat-nav-container">
                <Link to="/" className="habitat-logo">
                    <span className="habitat-icon">🌿</span>
                    <span className="habitat-title">AURA Habitat</span>
                </Link>

                <div className="habitat-nav-actions">
                    {tree && (
                        <div className="token-stats">
                            <span>💧 {tree.current_xp} Su</span>
                            <span>⭐ Lvl {tree.current_level}</span>
                        </div>
                    )}
                    {QuickNotesComponent}
                    <Link to="/" className="nav-back-btn">
                        ← Ana Sayfa
                    </Link>
                    <button
                        className="logout-btn"
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }}
                    >
                        Çıkış
                    </button>
                </div>
            </div>
        </nav>
    );
}
