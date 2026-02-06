import { Link } from 'react-router-dom';
import './FinanceNavbar.css';

interface FinanceNavbarProps {
    onChatToggle: () => void;
}

export default function FinanceNavbar({ onChatToggle }: FinanceNavbarProps) {
    return (
        <nav className="finance-navbar">
            <div className="finance-nav-container">
                <Link to="/" className="finance-logo">
                    <span className="squirrel-icon">🐿️</span>
                    <span className="finance-title">TUSU Finance</span>
                </Link>

                <div className="finance-nav-actions">
                    <button
                        className="chat-toggle-btn"
                        onClick={onChatToggle}
                    >
                        <span className="chat-icon">💬</span>
                        TUSU ile Sohbet Et
                    </button>
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
