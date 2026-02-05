import './RecommendationCard.css';

interface Recommendation {
    asset: string;
    trend: string;
    estimatedGain: number;
    message: string;
}

interface RecommendationCardProps {
    recommendation: Recommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
    const getAssetIcon = (asset: string) => {
        if (asset.includes('USD') || asset.includes('Dollar')) return '💵';
        if (asset.includes('EUR') || asset.includes('Euro')) return '💶';
        if (asset.includes('Gold') || asset.includes('Altın')) return '🪙';
        if (asset.includes('Fund') || asset.includes('Fon')) return '📈';
        if (asset.includes('Energy') || asset.includes('Enerji')) return '⚡';
        return '💰';
    };

    const getTrendColor = (trend: string) => {
        if (trend.includes('+') || trend.includes('↑')) return 'positive';
        if (trend.includes('-') || trend.includes('↓')) return 'negative';
        return 'neutral';
    };

    return (
        <div className="recommendation-card">
            <div className="recommendation-header">
                <span className="asset-icon">{getAssetIcon(recommendation.asset)}</span>
                <div className="asset-info">
                    <h4>Investment Recommendation</h4>
                    <span className="asset-name">{recommendation.asset}</span>
                </div>
            </div>

            <div className="recommendation-body">
                <div className="recommendation-stats">
                    <div className="stat-item">
                        <span className="stat-label">Trend</span>
                        <span className={`stat-value trend ${getTrendColor(recommendation.trend)}`}>
                            {recommendation.trend}
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Estimated Gain</span>
                        <span className="stat-value gain">
                            ₺{recommendation.estimatedGain.toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </span>
                    </div>
                </div>

                <div className="recommendation-message">
                    <span className="message-icon">💡</span>
                    <p>{recommendation.message}</p>
                </div>
            </div>
        </div>
    );
}

export default RecommendationCard;
