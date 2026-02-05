import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Look for root .env

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
    console.warn('⚠️ Gemini API Key is missing in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (modelName: string = 'gemini-pro') => {
    return genAI.getGenerativeModel({ model: modelName });
};
