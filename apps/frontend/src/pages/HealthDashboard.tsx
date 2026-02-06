import { useState } from 'react';
import { Link } from 'react-router-dom';
import { healthApi, BloodMetrics, DietPlan } from '../api/health';

export default function HealthDashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [metrics, setMetrics] = useState<BloodMetrics | null>(null);
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'upload' | 'analyzing' | 'planning' | 'done'>('upload');
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            // Adım 1: PDF Analizi
            setStep('analyzing');
            const parsedMetrics = await healthApi.uploadBloodPdf(file);
            setMetrics(parsedMetrics);

            // Adım 2: Diyet Planı
            setStep('planning');
            const plan = await healthApi.generateDietPlan(parsedMetrics);
            setDietPlan(plan);

            setStep('done');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
            setStep('upload');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="health-dashboard">
            <header className="dashboard-header">
                <Link to="/" className="back-btn">← Back to Hub</Link>
                <h1>🏥 Health Analysis</h1>
                <p>Upload your blood test PDF, get personalized AI insights.</p>
            </header>

            <div className="health-container glass-panel">
                {/* Upload Section */}
                <div className="upload-section">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        id="file-upload"
                        className="file-input"
                        disabled={loading}
                    />
                    <label htmlFor="file-upload" className="file-label">
                        {file ? file.name : '📄 Click or Drag PDF Here'}
                    </label>

                    {file && step === 'upload' && (
                        <button onClick={handleProcess} className="action-btn">
                            Analyze & Generate Plan 🚀
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>
                            {step === 'analyzing' && '🔍 Extracting data from PDF...'}
                            {step === 'planning' && '🥗 Creating your personalized diet plan...'}
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && <div className="error-message">{error}</div>}

                {/* Results Section */}
                {step === 'done' && metrics && dietPlan && (
                    <div className="results-grid">
                        {/* Sol Kolon: Kan Değerleri */}
                        <div className="metrics-column">
                            <h2>🩸 Blood Metrics</h2>
                            <div className="metrics-list">
                                {Object.entries(metrics).map(([key, value]) => (
                                    <div key={key} className="metric-item">
                                        <span className="metric-name">{key.toUpperCase()}</span>
                                        <span className="metric-value">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="recommendations-box">
                                <h3>Dr. AI Notes</h3>
                                <ul>
                                    {dietPlan.recommendations.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Sağ Kolon: Diyet Planı */}
                        <div className="plan-column">
                            <h2>🥗 Nutrition Plan</h2>
                            <p className="plan-overview">{dietPlan.overview}</p>

                            <div className="food-lists">
                                <div className="food-list good">
                                    <h4>✅ Focus On</h4>
                                    <p>{dietPlan.foods_to_focus.join(', ')}</p>
                                </div>
                                <div className="food-list bad">
                                    <h4>⚠️ Limit</h4>
                                    <p>{dietPlan.foods_to_limit.join(', ')}</p>
                                </div>
                            </div>

                            <h3>📅 Sample Meal Plan (Day 1)</h3>
                            {dietPlan.meal_plan[0] && (
                                <div className="meal-card">
                                    <div className="meal-row">
                                        <span className="meal-icon">🍳</span>
                                        <div><strong>Breakfast:</strong> {dietPlan.meal_plan[0].meals.breakfast}</div>
                                    </div>
                                    <div className="meal-row">
                                        <span className="meal-icon">🥗</span>
                                        <div><strong>Lunch:</strong> {dietPlan.meal_plan[0].meals.lunch}</div>
                                    </div>
                                    <div className="meal-row">
                                        <span className="meal-icon">🍛</span>
                                        <div><strong>Dinner:</strong> {dietPlan.meal_plan[0].meals.dinner}</div>
                                    </div>
                                    <div className="meal-row">
                                        <span className="meal-icon">🍎</span>
                                        <div><strong>Snacks:</strong> {dietPlan.meal_plan[0].meals.snacks.join(', ')}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
