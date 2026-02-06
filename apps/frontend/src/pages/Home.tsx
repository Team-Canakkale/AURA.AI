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
                    <ServiceCard
                        title="💰 Finance Service"
                        status={services.finance}
                        description="Track your financial transactions and budgets"
                        link="/finance"
                    />

                    <ServiceCard
                        title="🏥 Health"
                        status={services.health}
                        description="Blood analysis & wellness tracking"
                        link="/blood-analysis"
                    />

                    <ServiceCard
                        title="✅ Habit Tracker"
                        status={services.habit}
                        description="Build and maintain positive habits"
                        link="/habitat"
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
    link?: string;
}

function ServiceCard({ title, status, description, link }: ServiceCardProps) {
    const card = (
        <div className={`service-card ${status?.status === 'ok' ? 'active' : 'inactive'}`}>
            <h2>{title}</h2>
            <p className="description">{description}</p>
            <div className="status">
                <span className={`status-indicator ${status?.status === 'ok' ? 'online' : 'offline'}`}>
                    {status?.status === 'ok' ? '● Online' : '○ Offline'}
                </span>
            </div>
        </div>
    );

    return link ? <Link to={link || "#"} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

export default Home
