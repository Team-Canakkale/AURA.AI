import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './pages/LoginPage'
import FinanceDashboard from './pages/FinanceDashboard'

interface ServiceStatus {
    status: string;
    service: string;
    timestamp: string;
}

type Page = 'home' | 'finance' | 'habit' | 'health';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [services, setServices] = useState<{ [key: string]: ServiceStatus | null }>({
        finance: null,
        habit: null,
        health: null
    });

    useEffect(() => {
        const checkServices = async () => {
            const serviceEndpoints = [
                { name: 'finance', url: '/api/finance/health' },
                { name: 'habit', url: '/api/habit/health' },
                { name: 'health', url: '/api/health/health' }
            ];

            for (const endpoint of serviceEndpoints) {
                try {
                    const response = await fetch(endpoint.url);
                    const data = await response.json();
                    setServices(prev => ({ ...prev, [endpoint.name]: data }));
                } catch (error) {
                    // Silent fail to avoid console spam when services are not running
                    // console.debug(`Service ${endpoint.name} offline`);
                    setServices(prev => ({ ...prev, [endpoint.name]: null }));
                }
            }
        };

        checkServices();
        const interval = setInterval(checkServices, 10000);
        return () => clearInterval(interval);
    }, []);

    // Login check
    if (!isLoggedIn) {
        return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
    }

    // Render different pages based on currentPage
    if (currentPage === 'finance') {
        return <FinanceDashboard onBack={() => setCurrentPage('home')} />;
    }

    return (
        <div className="app">
            <header className="header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', position: 'relative', paddingTop: '2rem' }}>
                    <div>
                        <h1>🌟 Aura AI Platform</h1>
                        <p className="subtitle">Multi-Service AI Dashboard</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            setIsLoggedIn(false);
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(244, 67, 54, 0.1)',
                            border: '1px solid rgba(244, 67, 54, 0.2)',
                            borderRadius: '50px',
                            color: '#f44336',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="main">
                <div className="services-grid">
                    <ServiceCard
                        title="💰 Finance Service"
                        status={services.finance}
                        description="Track your financial transactions and budgets with TUSU AI"
                        onClick={() => setCurrentPage('finance')}
                    />
                    <ServiceCard
                        title="🏥 Health Metrics"
                        status={services.health}
                        description="Monitor your health and wellness data"
                        onClick={() => setCurrentPage('health')}
                    />
                    <ServiceCard
                        title="✅ Habit Tracker"
                        status={services.habit}
                        description="Build and maintain positive habits"
                        onClick={() => setCurrentPage('habit')}
                    />
                </div>
            </main>
        </div>
    )
}

interface ServiceCardProps {
    title: string;
    status: ServiceStatus | null;
    description: string;
    onClick: () => void;
}

function ServiceCard({ title, status, description, onClick }: ServiceCardProps) {
    return (
        <div
            className={`service-card ${status?.status === 'ok' ? 'active' : 'inactive'}`}
            onClick={onClick}
        >
            <h2>{title}</h2>
            <p className="description">{description}</p>
            <div className="status">
                <span className={`status-indicator ${status?.status === 'ok' ? 'online' : 'offline'}`}>
                    {status?.status === 'ok' ? '● Online' : '○ Offline'}
                </span>
            </div>
        </div>
    )
}

export default App
