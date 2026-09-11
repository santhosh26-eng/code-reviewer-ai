"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage } from "@/types/chat";

interface CodeChatProps {
  currentCode: string;
  selectedLanguage: string;
}

export function CodeChat({ currentCode, selectedLanguage }: CodeChatProps) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const token = await getToken();
      const aiResponse = await sendChatMessage({
        message: trimmedInput,
        code: currentCode,
        language: selectedLanguage
      }, token);
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error connecting to the chat service.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col border-b border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-400" />
          AI Code Assistant
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Ask questions about your current code.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-zinc-500">
            <Bot className="h-8 w-8 mb-3 opacity-50" />
            <p>Paste your code and ask me<br/>how it works or to find bugs!</p>
            <div className="mt-4 flex flex-col gap-2 w-full max-w-[200px]">
              <button onClick={() => setInput("Explain this function.")} className="text-xs bg-zinc-800/50 hover:bg-zinc-800 rounded px-2 py-1.5 transition-colors">Explain this function.</button>
              <button onClick={() => setInput("Can you optimize this?")} className="text-xs bg-zinc-800/50 hover:bg-zinc-800 rounded px-2 py-1.5 transition-colors">Can you optimize this?</button>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
              {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-indigo-400" />}
            </div>
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-100' : 'bg-zinc-800 text-zinc-200'}`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800">
              <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
            </div>
            <div className="flex items-center text-xs text-zinc-400 italic">
              AI is thinking...
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-3 border-t border-zinc-800 bg-zinc-950">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code..."
            className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-900 py-2 pl-3 pr-10 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[40px] max-h-[120px] scrollbar-thin"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-zinc-500 mt-2">
          Shift+Enter for new line. The AI reads your current code.
        </p>
      </div>
    </div>
  );
}
