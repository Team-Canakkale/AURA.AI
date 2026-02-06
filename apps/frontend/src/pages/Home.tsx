import { useState, useEffect, useRef } from 'react'
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
        <div className="home-container">
            {/* Cinematic Background - Ocean Wave Fade In */}
            <div className="ocean-background"></div>

            {/* Cinematic Element 1: Logo & Slogan (0.0s) */}
            {/* Cinematic Element 1: Logo & Slogan (0.0s) */}
            <header className="home-header animate-blur-in">
                <div className="logo-container">
                    <img src="/lumi.png" alt="Lumi Mascot" className="lumi-img" />
                    <h1 className="aura-logo">AURA.AI</h1>
                    <img src="/aura_icon.png" alt="Aura Logo" className="aura-logo-img" />
                </div>
                <p className="aura-slogan">Level Up Your Aura</p>
            </header>

            <main className="main-content">
                {/* Cinematic Element 2: Cards Slide Up (0.8s) */}
                <div className="services-grid animate-slide-up">
                    <TiltCard
                        title="💰 Finance"
                        status={services.finance}
                        description="Smart budgeting & expense tracking"
                        link="/finance"
                        color="var(--secondary)" // Blue
                    />

                    <TiltCard
                        title="🏥 Health"
                        status={services.health}
                        description="Blood analysis & wellness monitoring"
                        link="/blood-analysis"
                        color="var(--destructive)" // Red-ish/Pink
                    />

                    <TiltCard
                        title="✅ Habits"
                        status={services.habit}
                        description="Build routine & track progress"
                        link="/habitat"
                        color="var(--accent)" // Green
                    />
                </div>
            </main>

            {/* Cinematic Element 3: Aura Call & Tusu (1.2s) */}
            <footer className="home-footer animate-fade-in-delayed">
                <button className="aura-call-btn">
                    <span className="aura-icon">🔮</span>
                    Initialize Aura Call
                </button>
            </footer>
        </div>
    )
}

// 3D Tilt Card Component
interface TiltCardProps {
    title: string;
    status: ServiceStatus | null;
    description: string;
    link?: string;
    color?: string;
}

function TiltCard({ title, status, description, link, color }: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to card center
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation values (limit to +/- 10 degrees)
        const rotateX = ((y - centerY) / centerY) * -10; // Invert Y for natural tilt
        const rotateY = ((x - centerX) / centerX) * 10;

        // Calculate glare position (0-100%)
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;

        setRotation({ x: rotateX, y: rotateY });
        setGlarePosition({ x: glareX, y: glareY });
    };

    const handleMouseEnter = () => setIsHovering(true);

    const handleMouseLeave = () => {
        setIsHovering(false);
        // Reset rotation gracefully
        setRotation({ x: 0, y: 0 });
    };

    const cardContent = (
        <div
            className={`tilt-card ${status?.status === 'ok' ? 'active' : 'inactive'}`}
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
                transition: isHovering ? 'none' : 'transform 0.5s ease', // No transition while moving for instant response
                borderColor: isHovering && color ? color : 'rgba(255, 255, 255, 0.1)'
            }}
        >
            {/* Glare Effect */}
            <div
                className="card-glare"
                style={{
                    background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)`,
                    opacity: isHovering ? 0.4 : 0
                }}
            />

            <div className="card-content">
                <h2 style={{ color: isHovering && color ? color : 'inherit' }}>{title}</h2>
                <p className="description">{description}</p>
                <div className="status">
                    <span className={`status-indicator ${status?.status === 'ok' ? 'online' : 'offline'}`}>
                        {status?.status === 'ok' ? '● Online' : '○ Offline'}
                    </span>
                </div>
            </div>
        </div>
    );

    return link ? (
        <Link to={link} style={{ textDecoration: 'none', display: 'block' }}>
            {cardContent}
        </Link>
    ) : cardContent;
}

export default Home
