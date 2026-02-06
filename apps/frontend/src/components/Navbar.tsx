import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <nav className="global-navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <img src="/lumi_v2.png" alt="Lumi" className="navbar-lumi" />
                    <span className="navbar-title">AURA.AI</span>
                </Link>

                {/* Navigation Links */}
                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🏠</span>
                        <span className="nav-text">Ana Sayfa</span>
                    </Link>
                    <Link
                        to="/finance"
                        className={`nav-link ${isActive('/finance') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">💰</span>
                        <span className="nav-text">Finans</span>
                    </Link>
                    <Link
                        to="/blood-analysis"
                        className={`nav-link ${isActive('/blood-analysis') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🩸</span>
                        <span className="nav-text">Sağlık</span>
                    </Link>
                    <Link
                        to="/habitat"
                        className={`nav-link ${isActive('/habitat') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🌿</span>
                        <span className="nav-text">Alışkanlıklar</span>
                    </Link>
                </div>

                {/* User Actions */}
                <div className="navbar-actions">
                    <button
                        className="logout-btn"
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }}
                    >
                        <span>Çıkış</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
