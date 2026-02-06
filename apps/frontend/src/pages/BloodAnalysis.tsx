import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BloodAnalysis() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setResults(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/blood-analysis/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                let errorMessage = `Analysis failed (Status: ${response.status}).`;
                try {
                    const errorData = await response.json();
                    if (errorData.detail) errorMessage = errorData.detail;
                } catch (e) {
                    errorMessage += ' Check if backend is running on port 4004.';
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setResults(data);
        } catch (err: any) {
            console.error('Analysis Error:', err);
            setError(err.message || 'An error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#6366f1' }}>← Back to Home</Link>
                <h1 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>🩸 Blood Analysis</h1>
                <p>AI-powered blood test analysis with personalized diet recommendations</p>
            </header>

            <div className="glass-panel" style={{ marginBottom: '2rem', padding: '2rem' }}>
                <div style={{
                    border: '2px dashed rgba(99, 102, 241, 0.5)',
                    borderRadius: '16px',
                    padding: '3rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        id="file-upload"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            {file ? file.name : 'Click to Upload Blood Test'}
                        </div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                            Supports PDF, JPG, PNG
                        </div>
                    </label>
                </div>

                {file && !results && (
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem 2rem',
                            marginTop: '1rem',
                            background: loading ? '#666' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '🔬 Analyzing...' : '🚀 Analyze Blood Test'}
                    </button>
                )}

                {error && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#fca5a5'
                    }}>
                        {error}
                    </div>
                )}
            </div>

            {results && (
                <div>
                    <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                        <h2>Diagnosis</h2>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #818cf8 0%, #ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '1rem 0'
                        }}>
                            {results.diagnosis}
                        </div>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1.5rem',
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '50px',
                            fontWeight: 600
                        }}>
                            {results.probability} Confidence
                        </div>
                    </div>

                    <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
                        <h2>📊 Blood Values</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '1rem',
                            marginTop: '1rem'
                        }}>
                            {Object.entries(results.extracted_values).map(([key, value]: [string, any]) => (
                                value > 0 && (
                                    <div key={key} style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        padding: '1rem',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                                            {key}
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>
                                            {value}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {results.diet_plan && (
                        <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
                            <h2>🍽️ Personalized Diet Plan</h2>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.8,
                                borderLeft: '4px solid #6366f1',
                                marginTop: '1rem'
                            }}>
                                {results.diet_plan}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => { setResults(null); setFile(null); }}
                        style={{
                            width: '100%',
                            padding: '1rem 2rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        ← New Analysis
                    </button>
                </div>
            )}
        </div>
    );
}
