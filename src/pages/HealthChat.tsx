import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, HeartPulse, TrendingUp, Clock } from 'lucide-react';
import { askQuestion, getChatHistory } from '../services/api';
import type { ChatMessage, ChatResponse } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HealthChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { text: 'What is my latest health score?', icon: HeartPulse },
    { text: 'Explain my most recent blood test', icon: MessageSquare },
    { text: 'What foods can improve my iron levels?', icon: TrendingUp },
    { text: 'When should I get retested?', icon: Clock },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      timestamp: new Date().toISOString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response: ChatResponse = await askQuestion(input, sessionId || undefined);

      if (!sessionId) {
        setSessionId(response.session_id);
      }

      const assistantMessage: ChatMessage = {
        timestamp: new Date().toISOString(),
        role: 'assistant',
        content: response.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        timestamp: new Date().toISOString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // Auto-focus on textarea after selecting
    const textarea = document.querySelector('textarea');
    setTimeout(() => textarea?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <div className="bg-slate-800/50 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/50">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Health Q&A Assistant
              </h1>
              <p className="text-sm text-gray-400">Ask me anything about your health records</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-4 shadow-lg shadow-cyan-500/50">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-400 mb-8">
                Ask me questions about your health records and get personalized answers
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question.text)}
                    className="group text-left p-4 bg-slate-700/50 border border-cyan-500/20 rounded-lg hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all duration-300 hover:bg-slate-700/70"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-all">
                        <question.icon className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 group-hover:text-cyan-300 transition-colors">{question.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`flex items-start space-x-3 max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50 hover:scale-110'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50 hover:scale-110 animate-pulse-glow'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                <div
                  className={`px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-800/50 border border-cyan-500/20 text-gray-200 backdrop-blur-xl hover:border-cyan-500/40'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 flex items-center gap-1 ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-800/50 border border-cyan-500/20 px-4 py-3 rounded-2xl backdrop-blur-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border-t border-cyan-500/20 p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-3 animate-fade-in">
            <div className="flex-1 relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask a question about your health..."
                rows={1}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none placeholder-gray-500 transition-all duration-200 hover:border-slate-500 group-hover:border-cyan-500/40"
              />
              {input.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-xl hover:shadow-cyan-500/70 group"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
