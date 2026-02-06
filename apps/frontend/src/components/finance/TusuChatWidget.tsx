import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TusuChatWidget.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface TusuChatWidgetProps {
    onClose: () => void;
    contextData?: any;
}

function TusuChatWidget({ onClose, contextData }: TusuChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load greeting on mount
        loadGreeting();
    }, []);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadGreeting = async () => {
        try {
            const response = await axios.get('/api/finance/api/chat/greeting');
            if (response.data.success) {
                setMessages([{
                    role: 'assistant',
                    content: response.data.data.message,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error('Failed to load greeting:', error);
            setMessages([{
                role: 'assistant',
                content: "Merhaba! 🐿️ Ben TUSU, senin finans asistanın! Harcamalarınla ilgili bir sorum var mı?",
                timestamp: new Date()
            }]);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            const response = await axios.post('/api/finance/api/chat', {
                userMessage: inputMessage,
                contextData: contextData
            });

            if (response.data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: response.data.data.message,
                    timestamp: new Date(response.data.data.timestamp)
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "Üzgünüm, şu anda bir sorun yaşıyorum. Lütfen daha sonra tekrar dene! 🐿️",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickQuestions = [
        "Nerede tasarruf edebilirim?",
        "Dolar almak mantıklı mı?",
        "En çok nereye harcıyorum?",
        "Yatırım önerisi ver"
    ];

    const handleQuickQuestion = (question: string) => {
        setInputMessage(question);
    };

    return (
        <div className="tusu-chat-widget">
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="tusu-avatar">🐿️</div>
                    <div>
                        <h3>TUSU</h3>
                        <span className="status-dot"></span>
                        <span className="status-text">Online</span>
                    </div>
                </div>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        {message.role === 'assistant' && (
                            <div className="message-avatar">🐿️</div>
                        )}
                        <div className="message-content">
                            <p>{message.content}</p>
                            <span className="message-time">
                                {message.timestamp.toLocaleTimeString('tr-TR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message assistant">
                        <div className="message-avatar">🐿️</div>
                        <div className="message-content typing">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
                <div className="quick-questions">
                    {quickQuestions.map((question, index) => (
                        <button
                            key={index}
                            className="quick-question-btn"
                            onClick={() => handleQuickQuestion(question)}
                            disabled={loading}
                        >
                            {question}
                        </button>
                    ))}
                </div>
            )}

            <div className="chat-input-container">
                <textarea
                    className="chat-input"
                    placeholder="TUSU'ya bir şey sor..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    rows={1}
                />
                <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={loading || !inputMessage.trim()}
                >
                    <span className="send-icon">📤</span>
                </button>
            </div>
        </div>
    );
}

export default TusuChatWidget;
