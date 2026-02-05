/**
 * TUSU Chat Service
 * 
 * AI-powered conversational interface using Google Gemini
 * to help students understand their financial analysis and recommendations.
 */

import { getChatModel } from '../lib/gemini';

export class ChatService {
    /**
     * Generates a system prompt that defines TUSU's persona and context
     * @param contextData - Expense analysis and recommendation data
     * @returns System prompt string
     */
    private buildSystemPrompt(contextData?: any): string {
        let prompt = `You are TUSU, a friendly and cute squirrel mascot who helps students manage their finances.

Your personality:
- Friendly, encouraging, and supportive
- Simple and easy to understand (avoid complex financial jargon)
- Financially literate but explain concepts clearly
- Use emojis occasionally to be more engaging (🐿️ 💰 📊 ✨)
- Can respond in both Turkish and English based on user's language

Your goal:
- Help users understand their spending patterns
- Explain investment recommendations in simple terms
- Encourage good financial habits
- Make finance fun and accessible for students
`;

        // Add context if provided
        if (contextData) {
            prompt += `\nCurrent Analysis Context:\n`;

            if (contextData.totalPotentialSavings) {
                prompt += `- Total potential savings: ${contextData.totalPotentialSavings} TL\n`;
            }

            if (contextData.excessiveCategories && contextData.excessiveCategories.length > 0) {
                prompt += `- Excessive spending detected in:\n`;
                contextData.excessiveCategories.forEach((cat: any) => {
                    prompt += `  * ${cat.category}: ${cat.currentMonthSpending} TL (usually ${cat.averageMonthlySpending} TL)\n`;
                    if (cat.recommendation) {
                        prompt += `    Investment tip: ${cat.recommendation.message}\n`;
                    }
                });
            }

            if (contextData.message) {
                prompt += `- Summary: ${contextData.message}\n`;
            }
        }

        prompt += `\nRemember: Be encouraging and help the user take positive action! 🐿️`;

        return prompt;
    }

    /**
     * Gets a chat response from TUSU based on user message and context
     * @param userMessage - The user's question or message
     * @param contextData - Optional expense analysis data for context
     * @returns AI-generated response
     */
    public async getChatResponse(
        userMessage: string,
        contextData?: any
    ): Promise<string> {
        try {
            const model = getChatModel();

            // Build system prompt with context
            const systemPrompt = this.buildSystemPrompt(contextData);

            // Combine system prompt with user message
            const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nTUSU:`;

            // Generate response
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            return text;

        } catch (error: any) {
            console.error('Error generating chat response:', error);
            throw new Error(`Failed to generate chat response: ${error.message}`);
        }
    }

    /**
     * Future enhancement: Maintain conversation history for multi-turn chats
     */
    public async getChatResponseWithHistory(
        userMessage: string,
        conversationHistory: Array<{ role: string; content: string }>,
        contextData?: any
    ): Promise<string> {
        // TODO: Implement conversation history management
        // This would allow for multi-turn conversations with context
        console.log('Conversation history - To be implemented');
        return this.getChatResponse(userMessage, contextData);
    }
}
