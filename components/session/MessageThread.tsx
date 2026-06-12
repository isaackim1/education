"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage, Message } from "@/lib/types";
import MessageBlock from "./MessageBlock";

type ThreadMessage = Message | ChatMessage;

interface MessageThreadProps {
  messages: ThreadMessage[];
  onSaveMistake?: (messageId: string) => void;
  savedMistakeMessageIds?: ReadonlySet<string>;
  agentLabel?: string;
}

export default function MessageThread({
  messages,
  onSaveMistake,
  savedMistakeMessageIds,
  agentLabel,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#7A766D]">
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
          agentLabel={agentLabel}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
