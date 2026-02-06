/**
 * TUSU Chat Service
 * 
 * AI-powered conversational interface using OpenAI GPT-4o mini
 * to help students understand their financial analysis and recommendations.
 */

import { openai, getOpenAIModel } from '../lib/openai';
import { supabase } from '../lib/supabase';

export class ChatService {
    /**
     * Determine the date range based on user query
     */
    private getDateRangeFromQuery(query: string): Date | null {
        const now = new Date();
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('hafta') || lowerQuery.includes('week')) {
            const date = new Date();
            date.setDate(now.getDate() - 7);
            return date;
        }
        if (lowerQuery.includes('3 ay') || lowerQuery.includes('3 month')) {
            const date = new Date();
            date.setMonth(now.getMonth() - 3);
            return date;
        }
        if (lowerQuery.includes('ay') || lowerQuery.includes('month')) {
            // Default to 1 month if just "month" is mentioned or specific "1 month"
            const date = new Date();
            date.setMonth(now.getMonth() - 1);
            return date;
        }

        return null;
    }

    /**
     * Fetch transactions from Supabase
     */
    private async fetchTransactionHistory(startDate: Date | null): Promise<string> {
        try {
            let query = supabase
                .from('transactions')
                .select('date, description, category, amount, currency')
                .order('date', { ascending: true }); // Reading flow: Oldest to Newest

            if (startDate) {
                query = query.gte('date', startDate.toISOString());
            } else {
                // If no date specified, fetch last 50 transactions to give context, but order by date descending to get latest, then reverse
                query = supabase
                    .from('transactions')
                    .select('date, description, category, amount, currency')
                    .order('date', { ascending: false })
                    .limit(50);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (!data || data.length === 0) {
                return "No transactions found.";
            }

            // If we fetched with limit(50) descending, reverse to make it chronological
            const transactionsToProcess = startDate ? data : data.reverse();

            // Summarize data to save tokens
            const summary = transactionsToProcess.map(t =>
                `- ${new Date(t.date).toLocaleDateString()}: ${t.description} (${t.category}) - ${t.amount} ${t.currency}`
            ).join('\n');

            return `Transaction History:\n${summary}`;

        } catch (error) {
            console.error('Error fetching history:', error);
            return "Could not fetch transaction history due to an error.";
        }
    }

    /**
     * Generates a system prompt that defines TUSU's persona and context
     * @param contextData - Expense analysis and recommendation data
     * @returns System prompt string
     */
    private buildSystemPrompt(contextData?: any, additionalContext?: string): string {
        let prompt = `You are TUSU, a friendly and cute squirrel mascot who helps students manage their finances.

Your personality:
- Friendly, encouraging, and supportive
- Simple and easy to understand (avoid complex financial jargon)
- Financially literate but explain concepts clearly
- Use emojis occasionally to be more engaging (🐿️ 💰 📊 ✨)
- Can respond in both Turkish and English based on user's language (Default to Turkish if unsure)

Your goal:
- Help users understand their spending patterns
- Explain investment recommendations in simple terms
- Encourage good financial habits
- Make finance fun and accessible for students
- IMPORTANT: When analyzing history, identify 3 key spending anomalies or trends and give 1 concrete actionable advice.
- If the user asks for a summary without specifying a date, analyze the 'Transaction History' provided in the context.
`;

        // Add additional context (Transaction History) if provided
        if (additionalContext) {
            prompt += `\n${additionalContext}\n`;
        }

        // Add context if provided (Current Session Analysis)
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
            let historyContext = "";
            const startDate = this.getDateRangeFromQuery(userMessage);

            // Fetch history if date is specified OR if user asks a general question about 'history', 'spending', 'summary'
            const lowerMsg = userMessage.toLowerCase();
            const needsHistory = startDate !== null ||
                lowerMsg.includes('özet') || lowerMsg.includes('summary') ||
                lowerMsg.includes('harcama') || lowerMsg.includes('spending') ||
                lowerMsg.includes('analiz') || lowerMsg.includes('analyze') ||
                lowerMsg.includes('neler') || lowerMsg.includes('what');

            if (needsHistory) {
                console.log(`Fetching history (Start Date: ${startDate ? startDate.toISOString() : 'None (Auto-Limit)'}) for query: "${userMessage}"`);
                historyContext = await this.fetchTransactionHistory(startDate);
            }

            // Build system prompt with context
            const systemPrompt = this.buildSystemPrompt(contextData, historyContext);

            // Generate response using OpenAI
            const completion = await openai.chat.completions.create({
                model: getOpenAIModel(),
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
            });

            return completion.choices[0].message.content || "Sincap dili tutuldu! Bir sorun oluştu. 🐿️";

        } catch (error: any) {
            console.error('Error generating chat response:', error);
            // Fallback friendly message
            return "Üzgünüm, şu anda düşüncelerimi toparlayamıyorum. Daha sonra tekrar dener misin? 🐿️";
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
        return this.getChatResponse(userMessage, contextData);
    }
}
