import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Settings as SettingsIcon, Trash2, Menu, MessageSquare } from 'lucide-react';
import { Message, Sender } from './types';
import { DEFAULT_SYSTEM_INSTRUCTION } from './constants';
import { createChatSession, sendMessageStream } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import SettingsPanel from './components/SettingsPanel';
import { Chat } from '@google/genai';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Sender.Model,
      text: "Hello! I am your personal Crypto Strategy Coach. I've been configured to help you build your influence and educate your audience about RWA and financial freedom. How can we start today?",
      timestamp: Date.now(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(DEFAULT_SYSTEM_INSTRUCTION);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // We keep the chat session in a ref so it persists across renders without triggering re-renders
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat session
  useEffect(() => {
    chatSessionRef.current = createChatSession(systemInstruction);
  }, [systemInstruction]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !chatSessionRef.current) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Sender.User,
      text: userText,
      timestamp: Date.now(),
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const botMessageId = (Date.now() + 1).toString();
      let accumulatedText = '';

      // Add placeholder bot message
      setMessages(prev => [
        ...prev,
        {
          id: botMessageId,
          role: Sender.Model,
          text: '',
          timestamp: Date.now(),
        },
      ]);

      await sendMessageStream(chatSessionRef.current, userText, (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
      });

    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: Sender.Model,
          text: "I encountered an error connecting to the strategy engine. Please check your connection or API key.",
          isError: true,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the current strategy session?")) {
      setMessages([]);
      // Re-initialize chat to clear context
      chatSessionRef.current = createChatSession(systemInstruction);
    }
  };

  const updateSystemInstruction = (newInstruction: string) => {
    setSystemInstruction(newInstruction);
    // Clear chat when persona changes to avoid context confusion
    setMessages([
      {
        id: Date.now().toString(),
        role: Sender.Model,
        text: "Strategy parameters updated. I am ready with the new configuration.",
        timestamp: Date.now(),
      }
    ]);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      
      {/* Sidebar (Desktop only, simple visual placeholder) */}
      <div className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-blue-400">
          <MessageSquare className="w-6 h-6" />
          <h1 className="font-bold text-lg tracking-tight text-white">CryptoCoach AI</h1>
        </div>
        <div className="flex-1 p-4">
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 text-xs text-blue-100 leading-relaxed">
            <p className="font-semibold mb-1">Active Persona:</p>
            Expert Marketing Strategist & Crypto Educator.
          </div>
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Shortcuts</h3>
            <div className="space-y-1">
                <button onClick={() => setInputValue("Donne-moi une stratégie pour la semaine.")} className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-sm text-slate-300 transition-colors truncate">
                    📅 Weekly Strategy
                </button>
                <button onClick={() => setInputValue("Analyse ce tweet : ")} className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-sm text-slate-300 transition-colors truncate">
                    🐦 Tweet Analysis
                </button>
                <button onClick={() => setInputValue("Comment augmenter mon engagement ?")} className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-sm text-slate-300 transition-colors truncate">
                    📈 Boost Engagement
                </button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-800">
           <div className="text-xs text-slate-600 text-center">Powered by Gemini 3 Pro</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10 sticky top-0">
          <div className="md:hidden flex items-center gap-2">
             <MessageSquare className="w-5 h-5 text-blue-500" />
             <span className="font-bold">CryptoCoach</span>
          </div>
          <div className="hidden md:block text-sm text-slate-400">
             Session: <span className="text-slate-200">Strategic Planning</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Configure Persona"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
               <div className="text-center mt-20 opacity-50">
                  <div className="bg-slate-900 inline-block p-4 rounded-full mb-4">
                    <MessageSquare size={32} className="text-blue-500" />
                  </div>
                  <p className="text-slate-400">Ready to define your strategy.</p>
               </div>
            )}
            
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Loading Indicator */}
            {isLoading && messages[messages.length - 1]?.role === Sender.User && (
               <div className="flex justify-start mb-6">
                 <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                   <div className="flex gap-1">
                     <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                     <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   </div>
                 </div>
               </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your Twitter strategy, RWA tokenization, or draft a tweet..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none min-h-[52px] max-h-[150px] shadow-lg"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all duration-200"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-600">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>

      </div>

      {/* Settings Modal */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentInstruction={systemInstruction}
        onSave={updateSystemInstruction}
      />

    </div>
  );
}

export default App;
