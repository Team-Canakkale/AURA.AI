import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FinanceDashboard.css';
import TusuChatWidget from '../components/finance/TusuChatWidget';
import ExpenseAnalyzer from '../components/finance/ExpenseAnalyzer';


interface Transaction {
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
}

interface CategoryAnalysis {
    category: string;
    averageMonthlySpending: number;
    currentMonthSpending: number;
    percentageChange: number;
    isExcessive: boolean;
    potentialSavings: number;
    recommendation?: {
        asset: string;
        trend: string;
        estimatedGain: number;
        message: string;
    };
}

interface AnalysisResult {
    analysisDate: string;
    totalPotentialSavings: number;
    excessiveCategories: CategoryAnalysis[];
    allCategories: CategoryAnalysis[];
    message: string;
    recommendations: string[];
}

function FinanceDashboard() {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);

    const handleAnalyze = async (newTransactions: Transaction[]) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/finance/api/analyze-expenses', {
                transactions: newTransactions
            });

            if (response.data.success) {
                setAnalysisResult(response.data.data);
            } else {
                setError('Analysis failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Analysis error:', err);
            setError(err.response?.data?.error || 'Failed to analyze expenses. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="finance-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="squirrel-icon">🐿️</div>
                        <div>
                            <h1>TUSU Finance</h1>
                            <p className="tagline">Akıllı Harca, Akıllı Yatır</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className="back-btn"
                            onClick={() => navigate('/')}
                        >
                            ← Ana Sayfa
                        </button>
                        <button
                            className="sign-out-btn"
                            onClick={() => {
                                // Clear session and redirect
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                        >
                            Çıkış Yap
                        </button>
                        <button
                            className="chat-toggle-btn"
                            onClick={() => setShowChat(!showChat)}
                        >
                            <span className="chat-icon">💬</span>
                            TUSU ile Sohbet Et
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-grid">
                    {/* Left Column - Expense Analyzer */}
                    <div className="analyzer-section">
                        <ExpenseAnalyzer onAnalyze={handleAnalyze} loading={loading} />

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Results */}
                    <div className="results-section">
                        {analysisResult ? (
                            <>
                                {/* Summary Card */}
                                <div className="summary-card">
                                    <div className="summary-header">
                                        <h2>💰 Analiz Özeti</h2>
                                        <span className="analysis-date">
                                            {new Date(analysisResult.analysisDate).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>

                                    <div className="total-savings">
                                        <span className="savings-label">Toplam Potansiyel Tasarruf</span>
                                        <span className="savings-amount">
                                            ₺{analysisResult.totalPotentialSavings.toLocaleString('tr-TR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>

                                    <p className="analysis-message">{analysisResult.message}</p>

                                    {analysisResult.recommendations.length > 0 && (
                                        <div className="quick-tips">
                                            <h3>💡 Hızlı İpuçları</h3>
                                            <ul>
                                                {analysisResult.recommendations.map((rec, idx) => (
                                                    <li key={idx}>{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Excessive Categories */}
                                {analysisResult.excessiveCategories.length > 0 && (
                                    <div className="excessive-categories">
                                        <h2>🚨 Geliştirilmesi Gereken Alanlar</h2>
                                        {analysisResult.excessiveCategories.map((category, idx) => (
                                            <div key={idx} className="category-card">
                                                <div className="category-header">
                                                    <h3>{category.category}</h3>
                                                    <span className={`change-badge ${category.percentageChange > 20 ? 'negative' : 'neutral'}`}>
                                                        {category.percentageChange}% (Toplam)
                                                    </span>
                                                </div>

                                                <div className="category-stats">
                                                    <div className="stat">
                                                        <span className="stat-label">Önerilen Limit (%20)</span>
                                                        <span className="stat-value">
                                                            ₺{category.averageMonthlySpending.toLocaleString('tr-TR')}
                                                        </span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">Bu Ay</span>
                                                        <span className="stat-value">
                                                            ₺{category.currentMonthSpending.toLocaleString('tr-TR')}
                                                        </span>
                                                    </div>
                                                    <div className="stat highlight">
                                                        <span className="stat-label">Potansiyel Tasarruf</span>
                                                        <span className="stat-value">
                                                            ₺{category.potentialSavings.toLocaleString('tr-TR')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="category-alert">
                                                    <span className="alert-icon">⚠️</span>
                                                    <p>
                                                        {category.category} için <strong>₺{category.currentMonthSpending.toLocaleString('tr-TR')}</strong> harcadınız
                                                        (Toplamın <strong>%{category.percentageChange.toFixed(1)}</strong>'i).
                                                        Önerilen limiti <strong>₺{category.potentialSavings.toLocaleString('tr-TR')}</strong> aştınız.
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* All Categories Breakdown (Excluding Excessive Ones) */}
                                {analysisResult.allCategories && analysisResult.allCategories.filter(cat => !cat.isExcessive).length > 0 && (
                                    <div className="all-categories-section">
                                        <h2>📊 Diğer Kategoriler</h2>
                                        <div className="categories-grid">
                                            {analysisResult.allCategories
                                                .filter(cat => !cat.isExcessive)
                                                .map((cat, idx) => (
                                                    <div key={idx} className="mini-category-card">
                                                        <div className="cat-info">
                                                            <span className="cat-name">{cat.category}</span>
                                                            <span className="cat-percent">{cat.percentageChange.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="cat-amount">
                                                            ₺{cat.currentMonthSpending.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <h3>Henüz Analiz Yok</h3>
                                <p>İşlemlerinizi ekleyin ve başlamak için "Harcamaları Analiz Et" butonuna tıklayın!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Chat Widget */}
            {showChat && (
                <TusuChatWidget
                    onClose={() => setShowChat(false)}
                    contextData={analysisResult}
                />
            )}
        </div>
    );
}

export default FinanceDashboard;
