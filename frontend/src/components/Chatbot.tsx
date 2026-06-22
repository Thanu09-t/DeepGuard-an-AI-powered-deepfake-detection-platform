import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am your DeepGuard AI Assistant. How can I help you analyze media today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const backendMessages = [
        ...messages.map(m => ({
          sender: m.sender,
          text: m.text
        })),
        {
          sender: 'user',
          text: userMessage.text
        }
      ];

      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: backendMessages
        })
      });

      if (!response.ok) {
        throw new Error('API_ERROR');
      }

      const data = await response.json();
      const aiResponseText = data.response || "I couldn't generate a response. Please try again.";
      
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: aiResponseText }]);
      
    } catch (error: any) {
      console.error('Chatbot Error:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'ai', 
        text: "Could not connect to the AI service. Please make sure the backend is running." 
      }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] liquid-glass rounded-2xl border border-primary/30 flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary glow-text" />
              <h3 className="text-white font-medium">DeepGuard AI</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-primary/20 ml-3' : 'bg-white/10 mr-3'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-[#050a15] rounded-tr-none' 
                      : 'bg-slate-800 text-white rounded-tl-none border border-white/10'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="flex flex-row max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 mr-3 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-slate-800 border border-white/10 text-slate-400 text-sm flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-[#050a15]/50">
            <form onSubmit={handleSend} className="flex relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-[#050a15] rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full glow-button-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default Chatbot;
