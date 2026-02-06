import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

interface ServiceStatus {
    status: string;
    service: string;
    timestamp: string;
}

function Home() {
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
                    // console.error(`Error checking ${endpoint.name}:`, error);
                    setServices(prev => ({ ...prev, [endpoint.name]: null }));
                }
            }
        };

        checkServices();
        const interval = setInterval(checkServices, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app">
            <header className="header">
                <h1>🌟 Aura AI Platform</h1>
                <p className="subtitle">Multi-Service AI Dashboard</p>
            </header>

            <main className="main">
                <div className="services-grid">
                    <Link to="/finance" style={{ textDecoration: 'none', color: 'white' }}>
                        <ServiceCard
                            title="💰 Finance Service"
                            status={services.finance}
                            description="Track your financial transactions and budgets"
                        />
                    </Link>
                    <ServiceCard
                        title="🏥 Health Metrics"
                        status={services.health}
                        description="Monitor your health and wellness data"
                    />

                    {/* Habit Tracker Card - Now Clickable */}
                    <Link to="/habitat" style={{ textDecoration: 'none', color: 'white' }}>
                        <ServiceCard
                            title="✅ Habit Tracker"
                            status={services.habit}
                            description="Build and maintain positive habits"
                        />
                    </Link>
                </div>
            </main>
        </div>
    )
}

interface ServiceCardProps {
    title: string;
    status: ServiceStatus | null;
    description: string;
}

function ServiceCard({ title, status, description }: ServiceCardProps) {
    return (
        <div className={`service-card ${status?.status === 'ok' ? 'active' : 'inactive'}`}>
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

export default Home
