import { ChatMessage as ChatMsg, SourceCitation } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMsg;
  sources?: SourceCitation[];
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  isLoading?: boolean;
}

export function ChatMessage({
  message,
  sources,
  suggestions,
  onSuggestionClick,
  isLoading,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5",
        isUser ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700"
      )}>
        {isUser ? "You" : "S"}
      </div>

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        {/* Message bubble */}
        <div className={cn(
          "rounded-xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-blue-900 text-white rounded-tr-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
        )}>
          {isLoading ? (
            <div className="flex gap-1 items-center py-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {/* Sources */}
        {!isUser && sources && sources.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 w-full">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sources</p>
            <ul className="space-y-1.5">
              {sources.map((source, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-gray-400 font-mono mt-0.5">[{i + 1}]</span>
                  <div>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline font-medium"
                      >
                        {source.title}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-700">{source.title}</span>
                    )}
                    {source.published_at && (
                      <span className="text-gray-400 ml-1">— {formatDate(source.published_at)}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Follow-up suggestions */}
        {!isUser && suggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
