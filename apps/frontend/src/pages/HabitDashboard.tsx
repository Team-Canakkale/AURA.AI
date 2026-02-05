import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { habitApi, taskApi, eventApi, Habit, Task, Event } from '../api/habit';

export default function HabitDashboard() {
    // --- STATE ---

    // Habits
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabit, setNewHabit] = useState('');

    // Tasks
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');

    // Events
    const [events, setEvents] = useState<Event[]>([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');

    // AI
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        const [habitsData, tasksData, eventsData] = await Promise.all([
            habitApi.getHabits(),
            taskApi.getTasks(),
            eventApi.getEvents()
        ]);
        setHabits(habitsData);
        setTasks(tasksData);
        setEvents(eventsData);
    };

    // --- HANDLERS ---

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit) return;
        await habitApi.createHabit({ name: newHabit, frequency: 'daily' });
        setNewHabit('');
        loadAllData();
        askAI(`I started a new habit: ${newHabit}. Motivate me!`);
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle) return;
        await taskApi.createTask({ title: newTaskTitle, priority: newTaskPriority });
        setNewTaskTitle('');
        loadAllData();
    };

    const toggleTask = async (task: Task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        await taskApi.updateTaskStatus(task.id, newStatus);
        loadAllData();
    };

    const handleDeleteTask = async (id: string) => {
        await taskApi.deleteTask(id);
        loadAllData();
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle || !newEventDate) return;
        await eventApi.createEvent({ title: newEventTitle, event_date: newEventDate, type: 'reminder' });
        setNewEventTitle('');
        setNewEventDate('');
        loadAllData();
    };

    const handleDeleteEvent = async (id: string) => {
        await eventApi.deleteEvent(id);
        loadAllData();
    };

    const askAI = async (prompt: string) => {
        setAiLoading(true);
        const res = await habitApi.askAICoach(prompt);
        setAiResponse(res);
        setAiLoading(false);
    };

    // Sort tasks: Big One first
    const sortedTasks = [...tasks].sort((a, b) => {
        const pOrder = { 'big_one': 1, 'medium': 2, 'small': 3 };
        return (pOrder[a.priority as keyof typeof pOrder] || 99) - (pOrder[b.priority as keyof typeof pOrder] || 99);
    });

    return (
        <div className="habit-dashboard">
            <header className="dashboard-header">
                <Link to="/" className="back-btn">← Back to Hub</Link>
                <h1>🌿 Habitat Control Center</h1>
                <p>Manage your habits, tasks, and schedule in one place.</p>
            </header>

            <div className="habitat-grid">

                {/* 1. HABITS COLUMN */}
                <div className="column glass-panel">
                    <h2>🔥 Habits</h2>
                    <form onSubmit={handleAddHabit} className="mini-form">
                        <input
                            value={newHabit}
                            onChange={e => setNewHabit(e.target.value)}
                            placeholder="New habit..."
                        />
                        <button type="submit">+</button>
                    </form>
                    <div className="list">
                        {habits.map((h, i) => (
                            <div key={i} className="item habit-item">
                                <span>{h.name}</span>
                                <div className="streak-badge">🔥 {h.streak || 0}</div>
                            </div>
                        ))}
                        {habits.length === 0 && <p className="empty">No active habits.</p>}
                    </div>
                </div>

                {/* 2. TASKS COLUMN */}
                <div className="column glass-panel task-column">
                    <h2>✅ Task Matrix</h2>
                    <form onSubmit={handleAddTask} className="mini-form task-form">
                        <input
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            placeholder="New task..."
                        />
                        <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                            <option value="big_one">⭐ Big One</option>
                            <option value="medium">Medium</option>
                            <option value="small">Small</option>
                        </select>
                        <button type="submit">+</button>
                    </form>

                    <div className="list task-list">
                        {sortedTasks.map(task => (
                            <div key={task.id} className={`item task-item ${task.priority} ${task.status}`}>
                                <div className="task-left">
                                    <input
                                        type="checkbox"
                                        checked={task.status === 'completed'}
                                        onChange={() => toggleTask(task)}
                                    />
                                    <span className="task-title">{task.title}</span>
                                </div>
                                <button onClick={() => handleDeleteTask(task.id)} className="del-btn">×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. AI & EVENTS COLUMN */}
                <div className="column right-col">

                    {/* AI Coach */}
                    <div className="glass-panel ai-panel">
                        <h2>🤖 AI Coach</h2>
                        <div className="ai-chat">
                            {aiResponse || "Ready to motivate you!"}
                        </div>
                        <div className="ai-actions">
                            <button onClick={() => askAI("Give me a stoic quote about discipline.")}>Stoic Quote</button>
                            <button onClick={() => askAI("How to overcome procrastination?")}>Stop Procrastinating</button>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="glass-panel events-panel">
                        <h2>📅 Upcoming</h2>
                        <form onSubmit={handleAddEvent} className="mini-form">
                            <input
                                value={newEventTitle}
                                onChange={e => setNewEventTitle(e.target.value)}
                                placeholder="Event..."
                            />
                            <input
                                type="date"
                                value={newEventDate}
                                onChange={e => setNewEventDate(e.target.value)}
                                style={{ width: '120px' }}
                            />
                            <button type="submit">+</button>
                        </form>
                        <div className="list">
                            {events.map((ev, i) => (
                                <div key={i} className="item event-item">
                                    <div className="event-date">
                                        {new Date(ev.event_date).toLocaleDateString()}
                                    </div>
                                    <div className="event-title">{ev.title}</div>
                                    <button onClick={() => handleDeleteEvent(ev.id)} className="del-btn">×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
