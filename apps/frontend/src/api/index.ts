import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Finance API
export const financeAPI = {
    getTransactions: () => api.get('/api/finance/transactions'),
    createTransaction: (data: { amount: number; description: string }) =>
        api.post('/api/finance/transactions', data),
    getHealth: () => api.get('/api/finance/health'),
};

// Habit API
export const habitAPI = {
    getHabits: () => api.get('/api/habit/habits'),
    createHabit: (data: { name: string; frequency: string }) =>
        api.post('/api/habit/habits', data),
    getHealth: () => api.get('/api/habit/health'),
};

// Health API
export const healthAPI = {
    getMetrics: () => api.get('/api/health/metrics'),
    createMetric: (data: any) => api.post('/api/health/metrics', data),
    getHealth: () => api.get('/api/health/health'),
};

export default api;