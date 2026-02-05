import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskApi, Task } from '../api/habit'; // Keeping the filename but using Task logic

export default function HabitDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'big_one' | 'medium' | 'small'>('medium');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await taskApi.getTasks();
            setTasks(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const newTask = await taskApi.createTask({
                title: newTaskTitle,
                priority: newTaskPriority
            });
            setTasks([...tasks, newTask].sort((a, b) => {
                // Client side optimistic sort or just reload
                // Prioritize big_one > medium > small
                const p = { big_one: 1, medium: 2, small: 3 };
                return (p[a.priority as keyof typeof p] || 99) - (p[b.priority as keyof typeof p] || 99);
            }));

            // Reload to get server sorted list (guaranteed)
            loadTasks();

            setNewTaskTitle('');
            setNewTaskPriority('medium');
        } catch (err) {
            alert('Failed to create task');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            const updatedTask = await taskApi.toggleTaskStatus(id);
            setTasks(tasks.map(t => t.id === id ? updatedTask : t));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        // Removed confirm dialog for faster deletion as requested
        try {
            await taskApi.deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
            alert('Delete failed. Please check console.');
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'big_one': return <span className="badge priority-high">🔥 Big One</span>;
            case 'medium': return <span className="badge priority-medium">⚡ Medium</span>;
            case 'small': return <span className="badge priority-low">☕ Small</span>;
            default: return null;
        }
    };

    return (
        <div className="habit-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <Link to="/" className="back-btn">← Back to Hub</Link>
                <h1>🚀 Task Manager</h1>
                <p>Focus on what matters most.</p>
            </header>

            <div className="dashboard-grid full-width">
                {/* Main Task Section */}
                <div className="habits-section glass-panel">
                    <div className="section-header">
                        <h2>My Tasks</h2>
                        <span className="badge">{tasks.filter(t => t.status === 'pending').length} Pending</span>
                    </div>

                    {/* Add Task Form */}
                    <form onSubmit={handleAddTask} className="add-task-form">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="What needs to be done?"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="task-input"
                            />
                            <select
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                className="priority-select"
                            >
                                <option value="big_one">🔥 Big One</option>
                                <option value="medium">⚡ Medium</option>
                                <option value="small">☕ Small</option>
                            </select>
                            <button type="submit" className="add-btn">Add Task</button>
                        </div>
                    </form>

                    {/* Tasks List */}
                    {loading ? (
                        <div className="loading">Loading tasks...</div>
                    ) : (
                        <div className="tasks-list">
                            {tasks.map((task) => (
                                <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${task.priority}`}>
                                    <div className="task-left">
                                        <button
                                            className={`check-circle ${task.status === 'completed' ? 'checked' : ''}`}
                                            onClick={() => handleToggleStatus(task.id)}
                                        >
                                            {task.status === 'completed' && '✓'}
                                        </button>
                                        <div className="task-content">
                                            <span className="task-title">{task.title}</span>
                                            {getPriorityBadge(task.priority)}
                                        </div>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteTask(task.id)}
                                        title="Delete Task"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <p className="empty-state">No tasks yet. Add a 'Big One' to get started!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .add-task-form {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    background: rgba(255,255,255,0.05);
                    padding: 1rem;
                    border-radius: 12px;
                }
                .input-group {
                    display: flex;
                    width: 100%;
                    gap: 10px;
                }
                .task-input {
                    flex: 1;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(0,0,0,0.2);
                    color: white;
                }
                .priority-select {
                    padding: 12px;
                    border-radius: 8px;
                    background: #2a2a2a;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .add-btn {
                    padding: 0 24px;
                    background: #00bf8f;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .tasks-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .task-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    transition: all 0.2s;
                    border-left: 4px solid transparent;
                }
                .task-item.big_one { border-left-color: #ff4757; }
                .task-item.medium { border-left-color: #ffa502; }
                .task-item.small { border-left-color: #2ed573; }
                
                .task-item.completed {
                    opacity: 0.5;
                }
                .task-item.completed .task-title {
                    text-decoration: line-through;
                }
                .task-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .check-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.3);
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #00bf8f;
                    font-size: 14px;
                }
                .check-circle.checked {
                    background: rgba(0, 191, 143, 0.2);
                    border-color: #00bf8f;
                }
                .priority-high { background: rgba(255, 71, 87, 0.2); color: #ff4757; }
                .priority-medium { background: rgba(255, 165, 2, 0.2); color: #ffa502; }
                .priority-low { background: rgba(46, 213, 115, 0.2); color: #2ed573; }
                
                .delete-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    opacity: 0.5;
                    font-size: 1.2rem;
                }
                .delete-btn:hover {
                    opacity: 1;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}
