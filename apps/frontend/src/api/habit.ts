
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
            return await response.json();
        } catch (e) { return []; }
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
            return await response.json();
        } catch (e) { return []; }
    },

    createEvent: async (event: { title: string; event_date: string; end_date?: string; type: string; location?: string }) => {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        return await response.json();
    },

    deleteEvent: async (id: string) => {
        await fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' });
    }
};
