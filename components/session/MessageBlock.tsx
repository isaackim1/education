import type { Message } from "@/lib/types";

interface MessageBlockProps {
  message: Message;
  onSaveMistake?: (messageId: string) => void;
  isMistakeSaved?: boolean;
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
}: MessageBlockProps) {
  const isAgent = message.role === "agent";

  return (
    <div
      className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}
    >
      <span className="text-xs font-medium text-neutral-500 mb-1">
        {isAgent ? "Coach" : "You"}
      </span>
      <div
        className={`max-w-[85%] border rounded px-3 py-2 text-sm whitespace-pre-wrap ${
          isAgent
            ? "border-neutral-200 bg-neutral-50 text-black"
            : "border-neutral-300 bg-white text-black"
        }`}
      >
        {message.content}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-neutral-400">
          {formatTime(message.timestamp)}
        </span>
        {message.flaggedMistake && (
          <span className="flex items-center gap-2">
            {onSaveMistake && !isMistakeSaved ? (
              <button
                type="button"
                onClick={() => onSaveMistake(message.id)}
                className="text-xs text-neutral-500 underline hover:text-black"
              >
                Save as mistake
              </button>
            ) : isMistakeSaved ? (
              <span className="text-xs text-neutral-400">Saved</span>
            ) : (
              <span className="text-xs text-neutral-500">
                Flagged as possible mistake
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
