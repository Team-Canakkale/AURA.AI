import { useState } from 'react';
import { aiApi, MoodAnalysis } from '../api/habit';
import { motion, AnimatePresence } from 'framer-motion';

export default function MoodAnalyst() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MoodAnalysis | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        // Simulate delay for effect if API is too fast
        const minTime = new Promise(resolve => setTimeout(resolve, 1500));
        const [data] = await Promise.all([aiApi.analyzeMood(), minTime]);

        setResult(data || {
            mood: 'Connection Error',
            score: 0,
            advice: 'Could not connect to Aura AI. Please check your API key.'
        });
        setLoading(false);
    };

    return (
        <div className="glass-panel mood-analyst" style={{ marginBottom: '1rem', position: 'relative', overflow: 'hidden', minHeight: '200px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, marginBottom: '1rem' }}>
                🧠 Aura Analysis
            </h2>

            <AnimatePresence mode='wait'>
                {!result && !loading && (
                    <motion.div
                        key="start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', padding: '1rem' }}
                    >
                        <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Based on your recent Brain Dumps, let Aura detect your stress levels.
                        </p>
                        <button
                            onClick={handleAnalyze}
                            className="analyze-btn"
                        >
                            Analyze My Mental State
                        </button>
                    </motion.div>
                )}

                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', padding: '1rem' }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ fontSize: '3rem', display: 'inline-block', marginBottom: '1rem' }}
                        >
                            🧠
                        </motion.div>
                        <p className="pulsing-text" style={{ color: '#4caf50' }}>Scanning neural patterns...</p>
                    </motion.div>
                )}

                {result && !loading && (
                    <motion.div
                        key="result"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="analysis-result"
                    >
                        <div className="mood-header">
                            <span className="mood-label">Current Mood:</span>
                            <span
                                className={`mood-badge ${result.score > 7 ? 'good' : result.score < 4 ? 'bad' : 'neutral'}`}
                            >
                                {result.mood}
                            </span>
                        </div>

                        <div className="energy-bar-container">
                            <div className="bar-label">
                                <span>Energy Score</span>
                                <span>{result.score}/10</span>
                            </div>
                            <div className="progress-bg">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.score * 10}%` }}
                                    transition={{ duration: 1, type: "spring" }}
                                    style={{
                                        background: result.score > 7 ? '#4caf50' : result.score < 4 ? '#f44336' : '#ff9800'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="advice-box">
                            " {result.advice} "
                        </div>

                        {result.score < 4 && (
                            <div className="warning-alert">
                                ⚠️ Warning: Low energy detected. Your Habitat Tree might wither. Take a break!
                            </div>
                        )}

                        <button onClick={() => setResult(null)} className="retry-btn">Reset</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
