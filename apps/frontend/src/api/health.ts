
export interface BloodMetrics {
    hgb?: number;
    wbc?: number;
    rbc?: number;
    plt?: number;
    glucose?: number;
    cholesterol?: number;
}

export interface Meal {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
}

export interface DayPlan {
    day: string;
    meals: Meal;
}

export interface DietPlan {
    overview: string;
    recommendations: string[];
    foods_to_focus: string[];
    foods_to_limit: string[];
    hydration: string;
    meal_plan: DayPlan[];
}

const HEALTH_API_URL = '/api/health';

export const healthApi = {
    // 1. PDF yükle ve analiz et
    uploadBloodPdf: async (file: File): Promise<BloodMetrics> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${HEALTH_API_URL}/parse-blood`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to parse PDF');
        }

        const result = await response.json();
        return result.data;
    },

    // 2. Kan değerlerine göre diyet planı oluştur
    generateDietPlan: async (metrics: BloodMetrics): Promise<DietPlan> => {
        const response = await fetch(`${HEALTH_API_URL}/diet-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metrics),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate diet plan');
        }

        const result = await response.json();
        return result.data;
    }
};
