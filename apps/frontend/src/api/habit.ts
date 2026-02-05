
export interface Task {
    id: string;
    title: string;
    priority: 'big_one' | 'medium' | 'small';
    status: 'pending' | 'completed';
    created_at?: string;
}

const API_BASE_URL = '/api/habit';

export const taskApi = {
    getTasks: async (): Promise<Task[]> => {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        return await response.json();
    },

    createTask: async (task: { title: string; priority: string }) => {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        return await response.json();
    },

    toggleTaskStatus: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' }) // Simple toggle logic needs improve inside but this keeps it running
        });
        return await response.json();
    },

    deleteTask: async (id: string) => {
        await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
        return true;
    }
};
