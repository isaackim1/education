"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Chat, ChatMessage, MistakeCategory, Topic } from "@/lib/types";
import {
  createProjectMistakeFromChat,
  getProjectChat,
  saveProjectChat,
  saveProjectMistake,
} from "@/lib/project-storage";

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

function createEmptyChat(projectId: string): Chat {
  return {
    id: generateId(),
    projectId,
    messages: [],
    createdAt: new Date().toISOString(),
    lastMessageAt: null,
  };
}

function createChatMessage(
  role: ChatMessage["role"],
  content: string,
  flaggedMistake = false
): ChatMessage {
  return {
    id: generateId(),
    role,
    content,
    flaggedMistake,
    timestamp: new Date().toISOString(),
  };
}

function toApiMessages(
  messages: ChatMessage[]
): { role: "user" | "assistant"; content: string }[] {
  let apiMessages = messages.slice(-10).map((message) => ({
    role: message.role === "agent" ? ("assistant" as const) : ("user" as const),
    content: message.content,
  }));

  while (apiMessages.length > 0 && apiMessages[0].role === "assistant") {
    apiMessages = apiMessages.slice(1);
  }

  return apiMessages;
}

export type ProjectMistakeContext = {
  topics: Topic[];
  activeTopicName: string | null;
};

export type SendMessageOptions = {
  systemPrompt: string;
  contextMessage: string;
  mistakeContext?: ProjectMistakeContext;
};

function parseMistakeCategory(value: unknown): MistakeCategory {
  if (typeof value !== "string") return "conceptual";
  if (
    value === "conceptual" ||
    value === "calculation" ||
    value === "recall" ||
    value === "application"
  ) {
    return value;
  }
  return "conceptual";
}

export function useChat(projectId: string) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);

  const refreshChat = useCallback(() => {
    const existing = getProjectChat(projectId);
    if (existing) {
      setChat(existing);
      return;
    }

    const created = createEmptyChat(projectId);
    saveProjectChat(projectId, created);
    setChat(created);
  }, [projectId]);

  useEffect(() => {
    refreshChat();
    setIsLoaded(true);
  }, [refreshChat]);

  const persistChat = useCallback(
    (nextChat: Chat) => {
      saveProjectChat(projectId, nextChat);
      setChat(nextChat);
    },
    [projectId]
  );

  const appendMessage = useCallback(
    (message: ChatMessage) => {
      const current = getProjectChat(projectId) ?? createEmptyChat(projectId);
      const nextChat: Chat = {
        ...current,
        messages: [...current.messages, message],
        lastMessageAt: message.timestamp,
      };
      persistChat(nextChat);
    },
    [projectId, persistChat]
  );

  const sendMessage = useCallback(
    async (content: string, options: SendMessageOptions) => {
      const trimmed = content.trim();
      if (!trimmed || isSendingRef.current) return;

      const current = getProjectChat(projectId) ?? createEmptyChat(projectId);
      const studentMessage = createChatMessage("student", trimmed);
      const withStudent: Chat = {
        ...current,
        messages: [...current.messages, studentMessage],
        lastMessageAt: studentMessage.timestamp,
      };
      persistChat(withStudent);
      isSendingRef.current = true;
      setIsSending(true);

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: toApiMessages(withStudent.messages),
            systemPrompt: options.systemPrompt,
            contextMessage: options.contextMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Agent request failed");
        }

        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("reply" in data) ||
          typeof data.reply !== "string"
        ) {
          throw new Error("Invalid agent response");
        }

        const flaggedMistake =
          "flaggedMistake" in data && typeof data.flaggedMistake === "boolean"
            ? data.flaggedMistake
            : false;
        const mistakeCategory = parseMistakeCategory(
          "mistakeCategory" in data ? data.mistakeCategory : undefined
        );

        let agentMessage = createChatMessage(
          "agent",
          data.reply,
          flaggedMistake
        );

        if (flaggedMistake && options.mistakeContext) {
          const mistake = createProjectMistakeFromChat({
            projectId,
            studentAnswer: trimmed,
            agentReply: data.reply,
            mistakeCategory,
            topics: options.mistakeContext.topics,
            activeTopicName: options.mistakeContext.activeTopicName,
            messagesBeforeAgent: withStudent.messages,
          });
          const mistakeSaved = saveProjectMistake(projectId, mistake);
          if (mistakeSaved) {
            agentMessage = { ...agentMessage, mistakeSaved: true };
          }
        }

        const latest = getProjectChat(projectId) ?? withStudent;
        const withAgent: Chat = {
          ...latest,
          messages: [...latest.messages, agentMessage],
          lastMessageAt: agentMessage.timestamp,
        };
        persistChat(withAgent);
      } catch {
        const fallback = createChatMessage(
          "agent",
          "Ivvy could not respond right now. Check your connection and try again."
        );
        const latest = getProjectChat(projectId) ?? withStudent;
        const withFallback: Chat = {
          ...latest,
          messages: [...latest.messages, fallback],
          lastMessageAt: fallback.timestamp,
        };
        persistChat(withFallback);
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [projectId, persistChat]
  );

  return {
    chat,
    messages: chat?.messages ?? [],
    isLoaded,
    isSending,
    sendMessage,
    appendMessage,
    refreshChat,
  };
}
