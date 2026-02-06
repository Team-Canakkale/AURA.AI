import { Link } from 'react-router-dom';
import './HealthNavbar.css';

export default function HealthNavbar() {
    return (
        <nav className="health-navbar">
            <div className="health-nav-container">
                <Link to="/" className="health-logo">
                    <span className="health-icon">🩸</span>
                    <span className="health-title">AURA Health</span>
                </Link>

                <div className="health-nav-actions">
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
