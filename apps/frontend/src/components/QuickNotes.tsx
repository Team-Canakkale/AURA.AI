import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { notesApi, Note } from '../api/habit';

export default function QuickNotes() {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch notes when drawer opens
    useEffect(() => {
        if (isOpen) {
            loadNotes();
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const loadNotes = async () => {
        const data = await notesApi.getNotes();
        setNotes(data);
    };

    const handleSave = async () => {
        if (!newNote.trim()) return;
        setLoading(true);
        await notesApi.createNote(newNote);
        setNewNote('');
        await loadNotes();
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSave();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        await notesApi.deleteNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="quick-notes-trigger"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Brain Dump</span>
            </button>

            {/* Portal to Body */}
            {isOpen && createPortal(
                <>
                    {/* Overlay */}
                    <div
                        className={`quick-notes-overlay ${isOpen ? 'open' : ''}`}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer */}
                    <div className={`quick-notes-drawer ${isOpen ? 'open' : ''}`}>
                        <div className="drawer-header">
                            <h2>🧠 Brain Dump</h2>
                            <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
                        </div>

                        <div className="drawer-content">
                            {/* Input Section */}
                            <div className="note-input-section">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="What's on your mind? (Cmd+Enter to save)"
                                    rows={4}
                                    autoFocus
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={loading || !newNote.trim()}
                                    className="save-note-btn"
                                >
                                    {loading ? 'Saving...' : 'Save Note'}
                                </button>
                            </div>

                            {/* History Section */}
                            <div className="notes-history">
                                <h3>Recent Dumps</h3>
                                <div className="notes-list">
                                    {notes.length === 0 ? (
                                        <p className="empty-state">No thoughts logged yet.</p>
                                    ) : (
                                        notes.map(note => (
                                            <div key={note.id} className="note-card">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div className="note-time">
                                                        {new Date(note.created_at).toLocaleString('tr-TR', {
                                                            weekday: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(note.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#666',
                                                            fontSize: '1.2rem',
                                                            cursor: 'pointer',
                                                            padding: '0 4px',
                                                            lineHeight: '1',
                                                            marginTop: '-2px'
                                                        }}
                                                        className="delete-note-btn"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                <p className="note-content">{note.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
}
