
const API_BASE_URL = '/api/habit';

// --- TYPES ---

export interface Habit {
    id: number; // or string based on backend
    name: string;
    frequency: string;
    entries: string[];
    streak?: number;
}

export interface Task {
    id: string;
    title: string;
    priority: 'big_one' | 'medium' | 'small'; // big_one = Günün hedefi
    status: 'pending' | 'completed';
    created_at?: string;
}

export interface Event {
    id: string;
    title: string;
    event_date: string;
    end_date?: string;
    location?: string;
    type: string;
    status?: 'pending' | 'completed';
}

// --- API ---

// 1. Habit API
export const habitApi = {
    getHabits: async (): Promise<Habit[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/habits`);
            if (!response.ok) return []; // Graceful fallback
            const data = await response.json();
            return data.habits || [];
        } catch (e) { console.error(e); return []; }
    },

    createHabit: async (habit: { name: string; frequency: string }) => {
        const response = await fetch(`${API_BASE_URL}/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habit)
        });
        return await response.json();
    },

    askAICoach: async (prompt: string): Promise<string> => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: `As a motivational habit coach, answer: ${prompt}` })
            });
            const data = await response.json();
            return data.text || "Thinking...";
        } catch (e) { return "I'm offline right now."; }
    }
};

// 2. Task API
export const taskApi = {
    getTasks: async (): Promise<Task[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`);
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error("Failed to fetch tasks:", e);
            return [];
        }
    },

    createTask: async (task: { title: string; priority: string }) => {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        return await response.json();
    },

    updateTaskStatus: async (id: string, status: 'pending' | 'completed') => {
        await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
    },

    deleteTask: async (id: string) => {
        await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
    }
};

// 3. Event API
export const eventApi = {
    getEvents: async (): Promise<Event[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/events`);
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error("Failed to fetch events:", e);
            return [];
        }
    },

    createEvent: async (event: Omit<Event, 'id' | 'user_id' | 'created_at'>) => {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        return await response.json();
    },

    updateEvent: async (id: string, updates: Partial<Event>) => {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return await response.json();
    },

    deleteEvent: async (id: string) => {
        await fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' });
    }
};

// 4. Notes API (Brain Dump)
export interface Note {
    id: string;
    content: string;
    created_at: string;
}

export const notesApi = {
    getNotes: async (): Promise<Note[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`);
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error("Failed to fetch notes:", e);
            return [];
        }
    },

    createNote: async (content: string) => {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        return await response.json();
    },

    deleteNote: async (id: string) => {
        await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
    }
};

// 5. Gamification API (Habitat Tree)
export interface TreeState {
    id: string;
    current_xp: number;
    current_level: number;
    streak_days: number;
    last_watered_at: string;
}

export const gamificationApi = {
    getState: async (): Promise<TreeState | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/gamification`);
            if (!response.ok) return null;
            return await response.json();
        } catch (e) { return null; }
    },

    triggerAction: async (action: 'login' | 'task_complete' | 'event_attended', eventType?: string) => {
        const response = await fetch(`${API_BASE_URL}/gamification/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, eventType })
        });
        return await response.json();
    }
};

// 6. AI API
export interface MoodAnalysis {
    mood: string;
    score: number;
    advice: string;
}

export const aiApi = {
    analyzeMood: async (): Promise<MoodAnalysis | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/mood`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('AI Failed');
            return await response.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    }
};
