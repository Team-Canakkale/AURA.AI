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
    const [isCalling, setIsCalling] = useState(false);

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

    const handleAuraCall = async () => {
        setIsCalling(true);
        try {
            const response = await fetch('/api/habit/call', { method: 'POST' });
            const data = await response.json();

            if (!response.ok) {
                console.error('Call failed:', data.error);
                alert('Arama başlatılamadı: ' + (data.error || 'Bilinmeyen hata'));
                setIsCalling(false);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Bağlantı hatası oluştu.');
            setIsCalling(false);
        }
    };

    const handleEndCall = () => {
        setIsCalling(false);
    };

    return (
        <div className="home-container">
            {/* Cinematic Background - Ocean Wave Fade In */}
            <div className="ocean-background"></div>

            {/* Calling Overlay */}
            <div className={`calling-overlay ${isCalling ? 'active' : ''}`}>
                <div className="calling-content">
                    <div className="pulsing-phone-icon">
                        <span style={{ fontSize: '4rem' }}>📞</span>
                    </div>
                    <p className="calling-text">Aura Aranıyor...</p>
                    <button className="end-call-btn" onClick={handleEndCall}>
                        Aramayı Sonlandır
                    </button>
                </div>
            </div>

            {/* Main Content (Hidden when calling) */}
            <div className={`main-ui-layer ${isCalling ? 'hidden' : ''}`}>
                {/* Cinematic Element 1: Logo & Slogan (0.0s) */}
                <header className="home-header animate-blur-in">
                    <div className="logo-container">
                        <div className="lumi-wrapper">
                            <img src="/lumi_v2.png" alt="Lumi Mascot" className="lumi-img-v2" />
                        </div>
                        <h1 className="aura-logo">AURA.AI</h1>
                    </div>
                    <p className="aura-slogan">Auralarını Yükselt</p>
                </header>

                <main className="main-content">
                    {/* Cinematic Element 2: Cards Slide Up (0.8s) */}
                    <div className="services-grid animate-slide-up">
                        <TiltCard
                            title={
                                <div className="card-title-wrapper">
                                    <svg viewBox="0 0 24 24" className="card-icon finance-icon">
                                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.63-.34-1.34-2.12-1.38-2.63-.06-3.8-1.48-3.8-3.07 0-1.68 1.15-2.81 2.8-3.19V5h2.67v1.93c1.38.35 2.58 1.34 2.7 3.24h-1.97c-.1-1.19-.94-1.85-2.27-1.85-1.56 0-2.3.81-2.3 1.5 0 .7.62 1.25 2.1 1.29 2.5.06 3.81 1.45 3.81 3.1 0 1.63-1.11 2.92-2.69 3.22z" />
                                    </svg>
                                    <span>FİNANS</span>
                                </div>
                            }
                            status={services.finance}
                            description="Akıllı bütçe ve harcama takibi"
                            link="/finance"
                            color="var(--secondary)" // Blue
                        />

                        <TiltCard
                            title={
                                <div className="card-title-wrapper">
                                    <svg viewBox="0 0 24 24" className="card-icon health-icon">
                                        <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                    <span>SAĞLIK</span>
                                </div>
                            }
                            status={services.health}
                            description="Kan analizi ve sağlık takibi"
                            link="/blood-analysis"
                            color="var(--destructive)" // Red-ish/Pink
                        />

                        <TiltCard
                            title={
                                <div className="card-title-wrapper">
                                    <svg viewBox="0 0 24 24" className="card-icon habits-icon">
                                        <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                    </svg>
                                    <span>ALIŞKANLIKLAR</span>
                                </div>
                            }
                            status={services.habit}
                            description="Rutin oluştur ve ilerlemeyi takip et"
                            link="/habitat"
                            color="var(--accent)" // Green
                        />
                    </div>
                </main>

                {/* Cinematic Element 3: Aura Call & Tusu (1.2s) */}
                <footer className="home-footer animate-fade-in-delayed">
                    <button className="aura-call-btn" onClick={handleAuraCall}>
                        <span className="aura-icon">🔮</span>
                        Aura çağrına bir tık uzaktasın
                    </button>
                </footer>
            </div>
            {/* SVG Definitions for Gradients */}
            <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                <defs>
                    <linearGradient id="financeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#00d2ff', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#3a7bd5', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ff00cc', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#333399', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="habitsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#43e97b', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#38f9d7', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

// 3D Tilt Card Component
interface TiltCardProps {
    title: React.ReactNode;
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
                <div className="card-title" style={{ color: isHovering && color ? color : 'inherit' }}>{title}</div>
                <p className="description">{description}</p>
                <div className="status">
                    <span className={`status-indicator ${status?.status === 'ok' ? 'online' : 'offline'}`}>
                        {status?.status === 'ok' ? '● Çevrimiçi' : '○ Çevrimdışı'}
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
