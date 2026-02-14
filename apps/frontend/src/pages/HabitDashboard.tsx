import { useState, useEffect } from 'react';
import { taskApi, eventApi, gamificationApi, Task, Event } from '../api/habit';
import QuickNotes from '../components/QuickNotes';
import HabitatTree from '../components/HabitatTree';
import MoodAnalyst from '../components/MoodAnalyst';
import HabitatNavbar from '../components/habitat/HabitatNavbar';

const CITIES = [
    "Online", "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export default function HabitDashboard() {
    // --- STATE ---
    const [treeRefresh, setTreeRefresh] = useState(0);
    const [tree, setTree] = useState<any>(null);

    useEffect(() => {
        gamificationApi.getState().then(setTree).catch(console.error);
    }, [treeRefresh]);

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
    const [newEventType, setNewEventType] = useState('');
    const [showCityList, setShowCityList] = useState(false);
    const [showTypeList, setShowTypeList] = useState(false);
    const [showPriorityList, setShowPriorityList] = useState(false);

    const EVENT_TYPES = ['Class', 'Exam', 'Internship', 'Meeting', 'Reminder', 'Sports', 'Social', 'Other'];
    const PRIORITY_OPTIONS = [
        { value: 'big_one', label: '⭐ Big One' },
        { value: 'medium', label: 'Medium' },
        { value: 'small', label: 'Small' }
    ];




    // Initial Load & Game Login
    useEffect(() => {
        loadAllData();
        // Trigger generic login action
        gamificationApi.triggerAction('login').then(() => setTreeRefresh(p => p + 1));
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

        // Game Action: If completed, give XP
        if (newStatus === 'completed') {
            gamificationApi.triggerAction('task_complete').then(() => setTreeRefresh(p => p + 1));
        }

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
            type: newEventType || 'Other',
            location: newEventLocation
        });
        setNewEventTitle('');
        setNewEventDateVal('');
        setNewEventTimeVal('');
        setNewEventEndTimeVal('');
        setNewEventLocation('');
        setNewEventType('');
        loadAllData();
    };

    const handleDeleteEvent = async (id: string) => {
        await eventApi.deleteEvent(id);
        loadAllData();
    };

    const handleCompleteEvent = async (ev: Event) => {
        // Optimistic UI update (optional, but let's just wait for reload)
        await eventApi.updateEvent(ev.id, { status: 'completed' }); // Update DB
        await gamificationApi.triggerAction('event_attended', ev.type); // Give XP
        setTreeRefresh(p => p + 1); // Animate Tree
        loadAllData(); // Refresh Lists
    };



    // Sort tasks: Big One first
    const sortedTasks = [...tasks].sort((a, b) => {
        const pOrder = { 'big_one': 1, 'medium': 2, 'small': 3 };
        return (pOrder[a.priority as keyof typeof pOrder] || 99) - (pOrder[b.priority as keyof typeof pOrder] || 99);
    });

    // Helper: Countdown
    const getTimeLeft = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        if (diff < 0) return 'Expired';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} days left`;
        return `${hours} hrs left`;
    };

    return (
        <>
            <HabitatNavbar tree={tree} QuickNotesComponent={<QuickNotes />} />
            <div className="habit-dashboard" style={{ paddingTop: '8rem' }}>
                <div className="habitat-grid">
                    {/* 1. LEFT COLUMN: HABITAT & TASKS */}
                    <div className="column left-col">

                        {/* HABITAT GAME TREE */}
                        <HabitatTree refreshKey={treeRefresh} />

                        {/* MOOD ANALYST AI */}
                        <MoodAnalyst />


                    </div>

                    {/* 2. RIGHT COLUMN: EVENTS */}
                    <div className="column right-col">
                        <div className="glass-panel events-panel" style={{ position: 'relative', zIndex: 100 }}>
                            <div className="panel-header" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>📅 Upcoming Events</h2>
                            </div>
                            <form onSubmit={handleAddEvent} className="event-form-grid">

                                {/* ROW 1 */}
                                <div className="form-row">
                                    <input
                                        value={newEventTitle}
                                        onChange={e => setNewEventTitle(e.target.value)}
                                        placeholder="Event..."
                                        className="input-title"
                                        style={{ flex: 2 }}
                                    />
                                    <div className="type-wrapper" style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            value={newEventType}
                                            onChange={e => setNewEventType(e.target.value)}
                                            onFocus={() => setShowTypeList(true)}
                                            onBlur={() => setTimeout(() => setShowTypeList(false), 200)}
                                            placeholder="Type (e.g. Exam)"
                                            className="input-type"
                                            style={{ width: '100%', cursor: 'text' }}
                                        />
                                        {showTypeList && (
                                            <div className="city-dropdown" style={{ zIndex: 9999 }}>
                                                {EVENT_TYPES.filter(t => t.toLowerCase().includes(newEventType.toLowerCase())).map(type => (
                                                    <div
                                                        key={type}
                                                        className="city-option"
                                                        onClick={() => setNewEventType(type)}
                                                    >
                                                        {type}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ROW 2 */}
                                <div className="form-row">
                                    <input
                                        type="date"
                                        value={newEventDateVal}
                                        onChange={e => setNewEventDateVal(e.target.value)}
                                        className="input-date"
                                        style={{ flex: 1 }}
                                    />
                                    <div className="city-wrapper" style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            value={newEventLocation}
                                            onChange={e => setNewEventLocation(e.target.value)}
                                            onFocus={() => setShowCityList(true)}
                                            onBlur={() => setTimeout(() => setShowCityList(false), 200)}
                                            placeholder="📍 Location"
                                            style={{ width: '100%' }}
                                        />
                                        {showCityList && (
                                            <div className="city-dropdown" style={{ zIndex: 9999 }}>
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

                                {/* ROW 3 */}
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

                            {/* UPCOMING EVENTS */}
                            <div className="list">
                                {events.filter(e => e.status !== 'completed').map((ev, i) => (
                                    <div key={i} className="item event-card">
                                        <div className="event-date-box">
                                            <span className="day">{new Date(ev.event_date).getDate()}</span>
                                            <span className="month">{new Date(ev.event_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
                                        </div>
                                        <div className="event-info">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <h3 className="event-title-text">{ev.title}</h3>
                                                {ev.type && ev.type !== 'other' && ev.type !== 'reminder' && (
                                                    <span className="event-type-badge">{ev.type}</span>
                                                )}
                                            </div>
                                            <div className="event-meta">
                                                <span className="event-time">
                                                    🕒 {new Date(ev.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    {ev.end_date && ` - ${new Date(ev.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                                                </span>
                                                <span className={`countdown-badge ${getTimeLeft(ev.event_date).includes('left') ? 'active' : 'expired'}`}>
                                                    {getTimeLeft(ev.event_date)}
                                                </span>
                                                {ev.location && <span className="event-location">📍 {ev.location}</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <button onClick={() => handleCompleteEvent(ev)} className="complete-btn" style={{ background: 'rgba(76, 175, 80, 0.15)', border: '1px solid rgba(76, 175, 80, 0.3)', color: '#4caf50', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✓</button>
                                            <button onClick={() => handleDeleteEvent(ev.id)} className="del-btn">×</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* COMPLETED EVENTS */}
                            {events.filter(e => e.status === 'completed').length > 0 && (
                                <div className="completed-section">
                                    <h3>Past / Completed</h3>
                                    <div className="list">
                                        {events.filter(e => e.status === 'completed').map((ev, i) => (
                                            <div key={i} className="item event-card completed">
                                                <div className="event-date-box" style={{ opacity: 0.5 }}>
                                                    <span className="day">{new Date(ev.event_date).getDate()}</span>
                                                    <span className="month">{new Date(ev.event_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
                                                </div>
                                                <div className="event-info">
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <h3 className="event-title-text">{ev.title}</h3>
                                                    </div>
                                                    <div className="event-meta">
                                                        <span className="event-time">
                                                            {new Date(ev.event_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    {/* No complete button for completed events */}
                                                    <button onClick={() => handleDeleteEvent(ev.id)} className="del-btn">×</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Task Matrix (Moved to Right Column) */}
                        <div className="glass-panel task-panel">
                            <div className="panel-header">
                                <h2>✅ Task Matrix</h2>
                                <span className="badge">{tasks.filter(t => t.status === 'pending').length} pending</span>
                            </div>
                            <form onSubmit={handleAddTask} className="mini-form task-form">
                                <input
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    placeholder="New task..."
                                    style={{ flex: '1 1 0%', minWidth: '0' }}
                                />
                                <div className="priority-wrapper" style={{ flex: '0 10 120px', minWidth: '100px', position: 'relative' }}>
                                    <input
                                        value={PRIORITY_OPTIONS.find(p => p.value === newTaskPriority)?.label || newTaskPriority}
                                        readOnly
                                        onFocus={() => setShowPriorityList(true)}
                                        onBlur={() => setTimeout(() => setShowPriorityList(false), 200)}
                                        placeholder="Priority"
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    />
                                    {showPriorityList && (
                                        <div className="city-dropdown" style={{ zIndex: 9999 }}>
                                            {PRIORITY_OPTIONS.map(opt => (
                                                <div
                                                    key={opt.value}
                                                    className="city-option"
                                                    onClick={() => {
                                                        setNewTaskPriority(opt.value);
                                                        setShowPriorityList(false);
                                                    }}
                                                >
                                                    {opt.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button type="submit" style={{ flex: '0 0 35px' }}>+</button>
                            </form>

                            {/* ACTIVE TASKS */}
                            <div className="list task-list">
                                {sortedTasks.filter(t => t.status !== 'completed').map(task => (
                                    <div key={task.id} className={`item task-item ${task.priority}`}>
                                        <div className="task-left">
                                            <input
                                                type="checkbox"
                                                checked={false}
                                                onChange={() => toggleTask(task)}
                                            />
                                            <span className="task-title">{task.title}</span>
                                        </div>
                                        <button onClick={() => handleDeleteTask(task.id)} className="del-btn">×</button>
                                    </div>
                                ))}
                            </div>

                            {/* COMPLETED TASKS */}
                            {sortedTasks.filter(t => t.status === 'completed').length > 0 && (
                                <div className="completed-section">
                                    <h3>Completed Tasks</h3>
                                    <div className="list task-list">
                                        {sortedTasks.filter(t => t.status === 'completed').map(task => (
                                            <div key={task.id} className={`item task-item completed ${task.priority}`}>
                                                <div className="task-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={true}
                                                        onChange={() => toggleTask(task)}
                                                    />
                                                    <span className="task-title">{task.title}</span>
                                                </div>
                                                <button onClick={() => handleDeleteTask(task.id)} className="del-btn">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
