import { useState } from 'react';
import axios from 'axios';
import './FinanceDashboard.css';
import TusuChatWidget from '../components/finance/TusuChatWidget';
import ExpenseAnalyzer from '../components/finance/ExpenseAnalyzer';
import FinanceNavbar from '../components/finance/FinanceNavbar';


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
        <>
            <FinanceNavbar onChatToggle={() => setShowChat(!showChat)} />
            <div className="finance-dashboard" style={{ paddingTop: '80px' }}>
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
                                            <h2>💰 Analysis Summary</h2>
                                            <span className="analysis-date">
                                                {new Date(analysisResult.analysisDate).toLocaleDateString('en-US')}
                                            </span>
                                        </div>

                                        <div className="total-savings">
                                            <span className="savings-label">Total Potential Savings</span>
                                            <span className="savings-amount">
                                                ₺{analysisResult.totalPotentialSavings.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </span>
                                        </div>

                                        <p className="analysis-message">{analysisResult.message}</p>

                                        {analysisResult.recommendations.length > 0 && (
                                            <div className="quick-tips">
                                                <h3>💡 Quick Tips</h3>
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
                                            <h2>🚨 Areas for Improvement</h2>
                                            {analysisResult.excessiveCategories.map((category, idx) => (
                                                <div key={idx} className="category-card">
                                                    <div className="category-header">
                                                        <h3>{category.category}</h3>
                                                        <span className={`change-badge ${category.percentageChange > 20 ? 'negative' : 'neutral'}`}>
                                                            {category.percentageChange}% (Total)
                                                        </span>
                                                    </div>

                                                    <div className="category-stats">
                                                        <div className="stat">
                                                            <span className="stat-label">Recommended Limit (20%)</span>
                                                            <span className="stat-value">
                                                                ₺{category.averageMonthlySpending.toLocaleString('en-US')}
                                                            </span>
                                                        </div>
                                                        <div className="stat">
                                                            <span className="stat-label">This Month</span>
                                                            <span className="stat-value">
                                                                ₺{category.currentMonthSpending.toLocaleString('en-US')}
                                                            </span>
                                                        </div>
                                                        <div className="stat highlight">
                                                            <span className="stat-label">Potential Savings</span>
                                                            <span className="stat-value">
                                                                ₺{category.potentialSavings.toLocaleString('en-US')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="category-alert">
                                                        <span className="alert-icon">⚠️</span>
                                                        <p>
                                                            You spent <strong>₺{category.currentMonthSpending.toLocaleString('en-US')}</strong> for {category.category}
                                                            (<strong>{category.percentageChange.toFixed(1)}%</strong> of total).
                                                            You exceeded the recommended limit by <strong>₺{category.potentialSavings.toLocaleString('en-US')}</strong>.
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* All Categories Breakdown (Excluding Excessive Ones) */}
                                    {analysisResult.allCategories && analysisResult.allCategories.filter(cat => !cat.isExcessive).length > 0 && (
                                        <div className="all-categories-section">
                                            <h2>📊 Other Categories</h2>
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
                                                                ₺{cat.currentMonthSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                                    <h3>No Analysis Yet</h3>
                                    <p>Upload your data and click "Analyze Expenses" to start!</p>
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
        </>
    );
}

export default FinanceDashboard;
