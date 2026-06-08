"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import MessageBlock from "./MessageBlock";

interface MessageThreadProps {
  messages: Message[];
  onSaveMistake?: (messageId: string) => void;
  savedMistakeMessageIds?: ReadonlySet<string>;
}

export default function MessageThread({
  messages,
  onSaveMistake,
  savedMistakeMessageIds,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-neutral-500">
        No messages yet.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message) => (
        <MessageBlock
          key={message.id}
          message={message}
          onSaveMistake={onSaveMistake}
          isMistakeSaved={savedMistakeMessageIds?.has(message.id) ?? false}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
