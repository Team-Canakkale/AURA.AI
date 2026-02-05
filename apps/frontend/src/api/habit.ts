
export interface Habit {
    id: number;
    name: string;
    frequency: string;
    entries: string[]; // dates
    streak?: number;
    completed?: boolean;
}

const HABIT_API_URL = '/api/habit';

export const habitApi = {
    // Tüm alışkanlıkları getir
    getHabits: async (): Promise<Habit[]> => {
        try {
            const response = await fetch(`${HABIT_API_URL}/habits`);
            if (!response.ok) throw new Error('Failed to fetch habits');
            const data = await response.json();
            return data.habits || [];
        } catch (error) {
            console.error('Error fetching habits:', error);
            return [];
        }
    },

    // Yeni alışkanlık ekle
    createHabit: async (habit: { name: string; frequency: string }) => {
        try {
            const response = await fetch(`${HABIT_API_URL}/habits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(habit)
            });
            if (!response.ok) throw new Error('Failed to create habit');
            return await response.json();
        } catch (error) {
            console.error('Error creating habit:', error);
            throw error;
        }
    },

    // AI Koçuna danış
    askAICoach: async (prompt: string): Promise<string> => {
        try {
            const response = await fetch(`${HABIT_API_URL}/test-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: `As a motivational habit coach, answer this: ${prompt}` })
            });
            if (!response.ok) throw new Error('AI request failed');
            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('Error calling AI:', error);
            return "I'm having trouble connecting to my brain right now. Please try again later!";
        }
    }
};
