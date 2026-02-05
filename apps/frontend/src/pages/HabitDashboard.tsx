import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskApi, eventApi, Task, Event } from '../api/habit';
import QuickNotes from '../components/QuickNotes';

const CITIES = [
    "Online", "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export default function HabitDashboard() {
    // --- STATE ---



    // Tasks
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');

    // Events
    const [events, setEvents] = useState<Event[]>([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDateVal, setNewEventDateVal] = useState('');
    const [newEventTimeVal, setNewEventTimeVal] = useState('');
    const [newEventEndTimeVal, setNewEventEndTimeVal] = useState('');
    const [newEventLocation, setNewEventLocation] = useState('');
    const [newEventType, setNewEventType] = useState('diğer');
    const [showCityList, setShowCityList] = useState(false);

    // AI


    // Initial Load
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        const [tasksData, eventsData] = await Promise.all([
            taskApi.getTasks(),
            eventApi.getEvents()
        ]);
        setTasks(tasksData);
        setEvents(eventsData);
    };

    // --- HANDLERS ---



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
        if (!newEventTitle || !newEventDateVal || !newEventTimeVal) return;

        // Combine Date and Time and convert to ISO String (UTC) to fix timezone issue
        const combinedDateTime = new Date(`${newEventDateVal}T${newEventTimeVal}:00`).toISOString();
        const combinedEndDateTime = newEventEndTimeVal
            ? new Date(`${newEventDateVal}T${newEventEndTimeVal}:00`).toISOString()
            : undefined;

        await eventApi.createEvent({
            title: newEventTitle,
            event_date: combinedDateTime,
            end_date: combinedEndDateTime,
            type: newEventType,
            location: newEventLocation
        });
        setNewEventTitle('');
        setNewEventDateVal('');
        setNewEventTimeVal('');
        setNewEventEndTimeVal('');
        setNewEventLocation('');
        setNewEventType('diğer');
        loadAllData();
    };

    const handleDeleteEvent = async (id: string) => {
        await eventApi.deleteEvent(id);
        loadAllData();
    };



    // Sort tasks: Big One first
    const sortedTasks = [...tasks].sort((a, b) => {
        const pOrder = { 'big_one': 1, 'medium': 2, 'small': 3 };
        return (pOrder[a.priority as keyof typeof pOrder] || 99) - (pOrder[b.priority as keyof typeof pOrder] || 99);
    });

    // Helper: Countdown
    const getTimeLeft = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        if (diff < 0) return 'Süresi doldu';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} gün kaldı`;
        return `${hours} sa kaldı`;
    };

    return (
        <div className="habit-dashboard">
            <header className="dashboard-header">
                {/* Top Navigation Bar */}
                <div className="header-top-bar">
                    <Link to="/" className="back-link">
                        <span className="arrow">←</span> Hub
                    </Link>
                    <div className="header-actions">
                        <QuickNotes />
                    </div>
                </div>

                {/* Title Area */}
                <div className="header-title-area">
                    <h1>🌿 Habitat Control Center</h1>
                    <p>Manage your habits, tasks, and schedule in one place.</p>
                </div>
            </header>

            <div className="habitat-grid">



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



                    {/* Events */}
                    <div className="glass-panel events-panel">
                        <h2>📅 Upcoming</h2>
                        <form onSubmit={handleAddEvent} className="event-form-grid">

                            {/* ROW 1: Title & Type */}
                            <div className="form-row">
                                <input
                                    value={newEventTitle}
                                    onChange={e => setNewEventTitle(e.target.value)}
                                    placeholder="Event..."
                                    className="input-title"
                                    style={{ flex: 2 }}
                                />
                                <select
                                    value={newEventType}
                                    onChange={e => setNewEventType(e.target.value)}
                                    className="input-type"
                                    style={{ flex: 1, minWidth: '100px', cursor: 'pointer' }}
                                >
                                    <option value="diğer">Diğer</option>
                                    <option value="ders">Ders</option>
                                    <option value="sınav">Sınav</option>
                                    <option value="staj">Staj</option>
                                    <option value="hackathon">Hackathon</option>
                                    <option value="toplantı">Toplantı</option>
                                </select>
                            </div>

                            {/* ROW 2: Date & Location */}
                            <div className="form-row">
                                <input
                                    type="date"
                                    value={newEventDateVal}
                                    onChange={e => setNewEventDateVal(e.target.value)}
                                    className="input-date"
                                    style={{ flex: 1 }}
                                />
                                <div className="city-wrapper" style={{ flex: 1 }}>
                                    <input
                                        value={newEventLocation}
                                        onChange={e => setNewEventLocation(e.target.value)}
                                        onFocus={() => setShowCityList(true)}
                                        onBlur={() => setTimeout(() => setShowCityList(false), 200)}
                                        placeholder="📍 Location"
                                        style={{ width: '100%' }}
                                    />
                                    {showCityList && (
                                        <div className="city-dropdown">
                                            {CITIES.filter(c => c.toLowerCase().includes(newEventLocation.toLowerCase())).map(city => (
                                                <div
                                                    key={city}
                                                    className="city-option"
                                                    onClick={() => setNewEventLocation(city)}
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ROW 3: Time Range & Button */}
                            <div className="form-row">
                                <div className="time-range-group" style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="time"
                                        value={newEventTimeVal}
                                        onChange={e => setNewEventTimeVal(e.target.value)}
                                        className="input-time"
                                        style={{ flex: 1 }}
                                    />
                                    <span style={{ color: '#999' }}>-</span>
                                    <input
                                        type="time"
                                        value={newEventEndTimeVal}
                                        onChange={e => setNewEventEndTimeVal(e.target.value)}
                                        className="input-time"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                                <button type="submit" className="add-btn">+</button>
                            </div>

                        </form>
                        <div className="list">
                            {events.map((ev, i) => (
                                <div key={i} className="item event-card">
                                    {/* Left: Date Box */}
                                    <div className="event-date-box">
                                        <span className="day">
                                            {new Date(ev.event_date).getDate()}
                                        </span>
                                        <span className="month">
                                            {new Date(ev.event_date).toLocaleString('tr-TR', { month: 'short' }).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Center: Info */}
                                    <div className="event-info">
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <h3 className="event-title-text">{ev.title}</h3>
                                            {ev.type && ev.type !== 'diğer' && ev.type !== 'reminder' && (
                                                <span className="event-type-badge">{ev.type}</span>
                                            )}
                                        </div>
                                        <div className="event-meta">
                                            <span className="event-time">
                                                🕒 {new Date(ev.event_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                {ev.end_date && ` - ${new Date(ev.end_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
                                            </span>

                                            <span className={`countdown-badge ${getTimeLeft(ev.event_date).includes('kaldı') ? 'active' : 'expired'}`}>
                                                {getTimeLeft(ev.event_date)}
                                            </span>

                                            {ev.location && (
                                                <span className="event-location">
                                                    📍 {ev.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Action */}
                                    <button onClick={() => handleDeleteEvent(ev.id)} className="del-btn">
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
