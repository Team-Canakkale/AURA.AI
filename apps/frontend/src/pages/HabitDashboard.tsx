import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { habitApi, Habit } from '../api/habit';

export default function HabitDashboard() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [newHabit, setNewHabit] = useState('');

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        const data = await habitApi.getHabits();
        setHabits(data);
        setLoading(false);
    };

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit.trim()) return;

        await habitApi.createHabit({ name: newHabit, frequency: 'daily' });
        setNewHabit('');
        loadHabits();
        // Ask AI for motivation when adding a new habit
        askAI(`I just started a new habit: "${newHabit}". Give me a short motivational quote!`);
    };

    const askAI = async (prompt: string) => {
        setAiLoading(true);
        const response = await habitApi.askAICoach(prompt);
        setAiResponse(response);
        setAiLoading(false);
    };

    return (
        <div className="habit-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <Link to="/" className="back-btn">← Back to Hub</Link>
                <h1>🌿 Habitat</h1>
                <p>Build better habits, build a better you.</p>
            </header>

            <div className="dashboard-grid">
                {/* Left Column: Habits List */}
                <div className="habits-section glass-panel">
                    <div className="section-header">
                        <h2>My Habits</h2>
                        <span className="badge">{habits.length} Active</span>
                    </div>

                    {/* Add Habit Form */}
                    <form onSubmit={handleAddHabit} className="add-habit-form">
                        <input
                            type="text"
                            placeholder="Add a new habit..."
                            value={newHabit}
                            onChange={(e) => setNewHabit(e.target.value)}
                        />
                        <button type="submit">+</button>
                    </form>

                    {/* Habits List */}
                    {loading ? (
                        <div className="loading">Loading habits...</div>
                    ) : (
                        <div className="habits-list">
                            {habits.map((habit, index) => (
                                <div key={index} className="habit-item">
                                    <div className="habit-info">
                                        <h3>{habit.name}</h3>
                                        <span className="streak">🔥 0 Day Streak</span>
                                    </div>
                                    <button className="check-btn"></button>
                                </div>
                            ))}
                            {habits.length === 0 && (
                                <p className="empty-state">No habits yet. Start small!</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: AI Coach */}
                <div className="ai-section glass-panel">
                    <div className="section-header">
                        <h2>🤖 AI Coach</h2>
                    </div>

                    <div className="chat-box">
                        {aiResponse ? (
                            <div className="ai-message">
                                <p>{aiResponse}</p>
                            </div>
                        ) : (
                            <div className="ai-placeholder">
                                <p>Ready to help you stay on track!</p>
                            </div>
                        )}
                        {aiLoading && <div className="typing-indicator">Thinking...</div>}
                    </div>

                    <div className="quick-actions">
                        <button onClick={() => askAI("How can I stay consistent?")}>
                            💡 Tips for Consistency
                        </button>
                        <button onClick={() => askAI("Why is sleep important?")}>
                            💤 Sleep Advice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
