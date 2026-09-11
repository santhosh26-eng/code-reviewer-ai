"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage } from "@/types/chat";

interface CodeChatProps {
  currentCode: string;
  selectedLanguage: string;
}

const SUGGESTED_PROMPTS = [
  "What does this code do?",
  "Find bugs in my code.",
  "What is the time complexity?",
  "How can I optimize this?",
  "What edge cases are missing?",
  "Explain this line by line.",
];

export function CodeChat({ currentCode, selectedLanguage }: CodeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const token = await getToken();
      const aiResponse = await sendChatMessage(
        { message: msg, code: currentCode, language: selectedLanguage, history: messages },
        token
      );
      setMessages((prev) => [...prev, aiResponse]);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't reach the assistant. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
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
    <div className="flex h-full flex-col overflow-hidden">
      {/* Panel header */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600/20 border border-indigo-500/30">
          <Bot className="h-4 w-4 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 leading-none">AI Code Assistant</h2>
          <p className="text-[10px] text-zinc-500 mt-0.5">Ask questions about your code</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
            {/* Empty state icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-300">Ask anything about your code</p>
              <p className="text-xs text-zinc-500 mt-1">
                Paste code in the editor, then ask a question.
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="w-full max-w-xs space-y-1.5 px-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="w-full text-left text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md mt-0.5 ${
                msg.role === "user" ? "bg-indigo-600" : "bg-zinc-800"
              }`}
              aria-hidden="true"
            >
              {msg.role === "user" ? (
                <User className="h-3.5 w-3.5 text-white" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-indigo-400" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[82%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600/20 text-indigo-50 border border-indigo-500/20"
                  : "bg-zinc-800/80 text-zinc-200 border border-zinc-700/50"
              }`}
            >
              {msg.content}
              <div className="text-[9px] text-zinc-500 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isLoading && (
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-800">
              <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-3">
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Ask about your code
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code..."
            disabled={isLoading}
            rows={1}
            aria-label="Chat message input"
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 min-h-[38px] max-h-[120px] scrollbar-thin disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-1.5 text-center">
          Shift+Enter for new line · The assistant reads your current code
        </p>
      </div>
    </div>
  );
}
