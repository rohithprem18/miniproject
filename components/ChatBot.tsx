import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { Product } from '../types';
import { createAssistantChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface ChatBotProps {
  products: Product[];
  location: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ products, location }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: `Hello! I'm NexusBot. I see you have **${products.length} items** in your inventory in **${location}**. How can I help you manage your stock today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session
  useEffect(() => {
    if (isOpen && !chatSession) {
      const chat = createAssistantChat(products, location);
      setChatSession(chat);
    }
  }, [isOpen, location]); 

  // Update context when products change
  useEffect(() => {
    if (chatSession && isOpen && products.length > 0) {
      const inventorySummary = products.map(p => `${p.name} (${p.quantity})`).join(', ');
      
      const updateContext = async () => {
         try {
             await chatSession.sendMessage({ 
                 message: `SYSTEM UPDATE: The inventory has changed. The new list is: ${inventorySummary}.` 
             });
         } catch (e) {
             console.error("Failed to update chat context", e);
         }
      };
      updateContext();
    }
  }, [products.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result: GenerateContentResponse = await chatSession.sendMessage({ message: input });
      const responseText = result.text || "I'm having trouble connecting to the network.";
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "Sorry, I encountered an error processing your request." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown Parser for Bold (**text**) and Lists
  const renderMessageText = (text: string) => {
    const parseBold = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      
      // Headings
      if (trimmed.startsWith('## ')) {
        return <h4 key={i} className="font-bold text-lg text-slate-800 mt-2 mb-1">{parseBold(trimmed.replace(/^##\s/, ''))}</h4>;
      }
      if (trimmed.startsWith('### ')) {
        return <h5 key={i} className="font-bold text-base text-slate-800 mt-2 mb-1">{parseBold(trimmed.replace(/^###\s/, ''))}</h5>;
      }

      // Lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 ml-1 mb-1">
             <span className="text-slate-400 mt-1.5 w-1.5 h-1.5 bg-current rounded-full flex-shrink-0" />
             <span className="leading-relaxed">{parseBold(trimmed.replace(/^[\*\-]\s/, ''))}</span>
          </div>
        );
      }

      // Numbered Lists (Simple 1. 2. detection)
      if (/^\d+\.\s/.test(trimmed)) {
         return (
             <div key={i} className="ml-1 mb-1 block">
                 {parseBold(trimmed)}
             </div>
         )
      }

      // Empty lines
      if (trimmed === '') return <div key={i} className="h-2" />;

      // Paragraphs
      return <p key={i} className="mb-1 leading-relaxed">{parseBold(line)}</p>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 border border-slate-200 overflow-hidden pointer-events-auto flex flex-col h-[600px] transition-all duration-200 ease-in-out transform origin-bottom-right">
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">NexusBot</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">AI Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-600 rounded-tl-none'
                }`}>
                  {msg.role === 'user' ? (
                     <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                     <div className="space-y-1">
                        {renderMessageText(msg.text)}
                     </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-4 shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask NexusBot..."
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all placeholder-slate-400 group-hover:bg-white"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-white text-slate-800 rotate-90 ring-4 ring-slate-100' : 'bg-indigo-600 text-white ring-4 ring-indigo-200'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};