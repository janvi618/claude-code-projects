"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendChatMessage, ChatMessage as ChatMsg, SourceCitation } from "@/lib/api";
import { ChatMessage } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageWithMeta extends ChatMsg {
  id: string;
  sources?: SourceCitation[];
  suggestions?: string[];
}

const STARTER_QUESTIONS = [
  "What are Conagra's latest product launches?",
  "How are competitors responding to GLP-1 diet trends?",
  "What's happening in the protein snacks category?",
  "What did Kraft Heinz say in their last earnings call?",
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageWithMeta[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const token = (session as any)?.accessToken;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(messageText?: string) {
    const text = messageText || input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");

    const userMsg: MessageWithMeta = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Build history from last 5 turns (10 messages)
    const history = messages.slice(-10).map(({ role, content }) => ({ role, content }));

    try {
      const result = await sendChatMessage(text, history, token);

      const assistantMsg: MessageWithMeta = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        sources: result.sources,
        suggestions: result.suggestions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err.status === 429) {
        setError("Rate limit reached. You can send up to 20 messages per hour.");
      } else {
        setError(err.message || "Failed to get a response. Please try again.");
      }
      // Remove the user message if the request failed
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Research Chat</h1>
        <p className="text-sm text-gray-500">
          Ask questions about the competitive intelligence knowledge base.
        </p>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl p-4 space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">Ask about competitive intelligence</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              SCOUT searches the knowledge base and synthesizes answers with source citations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left text-sm px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                sources={msg.sources}
                suggestions={msg.suggestions}
                onSuggestionClick={handleSend}
              />
            ))}
            {loading && (
              <ChatMessage
                message={{ role: "assistant", content: "" }}
                isLoading
              />
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about competitive intelligence..."
          disabled={loading}
          className="flex-1"
        />
        <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
