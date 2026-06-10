import type { ChatMessage, Message } from "@/lib/types";

type ThreadMessage = Message | ChatMessage;

interface MessageBlockProps {
  message: ThreadMessage;
  onSaveMistake?: (messageId: string) => void;
  isMistakeSaved?: boolean;
  agentLabel?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageBlock({
  message,
  onSaveMistake,
  isMistakeSaved = false,
  agentLabel = "Coach",
}: MessageBlockProps) {
  const isAgent = message.role === "agent";

  return (
    <div
      className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}
    >
      <span className="text-xs font-medium text-[#5F6368] mb-1">
        {isAgent ? agentLabel : "You"}
      </span>
      <div
        className={`max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm whitespace-pre-wrap ${
          isAgent
            ? "border-[#E1E3E1] bg-[#F1F3F4] text-[#1F1F1F]"
            : "border-[#DADCE0] bg-white text-[#1F1F1F]"
        }`}
      >
        {message.content}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-[#80868B]">
          {formatTime(message.timestamp)}
        </span>
        {message.flaggedMistake && (
          <span className="flex items-center gap-2">
            {onSaveMistake && !isMistakeSaved ? (
              <button
                type="button"
                onClick={() => onSaveMistake(message.id)}
                className="text-xs font-medium text-[#5F6368] underline underline-offset-2 hover:text-[#1F1F1F]"
              >
                Save as mistake
              </button>
            ) : isMistakeSaved ? (
              <span className="text-xs font-medium text-[#137333]">Saved</span>
            ) : "mistakeSaved" in message && message.mistakeSaved ? (
              <>
                <span className="inline-flex items-center rounded-full bg-[#FEEFC3] px-2 py-0.5 text-xs font-medium text-[#B06000]">
                  Flagged as possible mistake
                </span>
                <span className="text-xs font-medium text-[#137333]">
                  Saved to mistake review
                </span>
              </>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#FEEFC3] px-2 py-0.5 text-xs font-medium text-[#B06000]">
                Flagged as possible mistake
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
