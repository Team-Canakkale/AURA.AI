/**
 * TUSU Chat Controller
 * 
 * Handles HTTP requests for AI chat interactions
 */

import { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';

export class ChatController {
    private chatService: ChatService;

    constructor() {
        this.chatService = new ChatService();
    }

    /**
     * POST /api/chat
     * Generates AI chat response based on user message and optional context
     */
    public chat = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userMessage, contextData } = req.body;

            // Validation
            if (!userMessage || typeof userMessage !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Invalid request: userMessage is required and must be a string'
                });
                return;
            }

            if (userMessage.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid request: userMessage cannot be empty'
                });
                return;
            }

            // Generate AI response
            const response = await this.chatService.getChatResponse(
                userMessage,
                contextData
            );

            // Return response
            res.status(200).json({
                success: true,
                data: {
                    message: response,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('Error in chat endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during chat interaction',
                details: error.message
            });
        }
    };

    /**
     * GET /api/chat/greeting
     * Returns a friendly greeting from TUSU
     */
    public getGreeting = async (req: Request, res: Response): Promise<void> => {
        try {
            const greetings = [
                "Merhaba! 🐿️ Ben TUSU, senin finans asistanın! Harcamalarınla ilgili bir sorum var mı?",
                "Hey there! 🐿️ I'm TUSU, your friendly finance squirrel! How can I help you save money today?",
                "Selam! 🐿️ Finans dünyasında kaybolmuş gibi hissediyor musun? Ben sana yardımcı olabilirim!",
                "Hi! 🐿️ Ready to learn how to make your money work smarter? Let's chat!"
            ];

            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

            res.status(200).json({
                success: true,
                data: {
                    message: randomGreeting
                }
            });

        } catch (error: any) {
            console.error('Error fetching greeting:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: error.message
            });
        }
    };
}
