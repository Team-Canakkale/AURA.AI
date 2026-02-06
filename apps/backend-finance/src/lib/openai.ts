import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn('⚠️ OpenAI API Key is missing in environment variables.');
}

export const openai = new OpenAI({
    apiKey: apiKey,
});

export const getOpenAIModel = () => {
    return 'gpt-4o-mini';
};
