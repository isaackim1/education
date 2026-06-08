"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import MessageThread from "@/components/session/MessageThread";
import SessionInput from "@/components/session/SessionInput";
import { useExam } from "@/hooks/useExam";
import { useMistakes } from "@/hooks/useMistakes";
import { useTopics } from "@/hooks/useTopics";
import { getMockAgentReply } from "@/lib/mock-agent";
import type { Message, MistakeCategory } from "@/lib/types";
import { daysUntilExam, generateId } from "@/lib/utils";

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mistakeId = searchParams.get("mistakeId");

  const { exam, isLoaded: examLoaded } = useExam();
  const { mistakes, markReviewed, isLoaded: mistakesLoaded } = useMistakes();
  const { topics, isLoaded: topicsLoaded } = useTopics();

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const hasOpenedRef = useRef(false);

  const isLoaded = examLoaded && mistakesLoaded && topicsLoaded;

  const mistake = mistakeId
    ? mistakes.find((m) => m.id === mistakeId) ?? null
    : null;

  function isReviewApiResponse(
    value: unknown
  ): value is {
    reply: string;
    flaggedMistake: boolean;
    mistakeCategory: MistakeCategory;
    resolved: boolean;
  } {
    return (
      typeof value === "object" &&
      value !== null &&
      "reply" in value &&
      typeof value.reply === "string" &&
      "flaggedMistake" in value &&
      typeof value.flaggedMistake === "boolean" &&
      "mistakeCategory" in value &&
      isMistakeCategory(value.mistakeCategory) &&
      "resolved" in value &&
      typeof value.resolved === "boolean"
    );
  }

  function isMistakeCategory(value: unknown): value is MistakeCategory {
    return (
      value === "conceptual" ||
      value === "calculation" ||
      value === "recall" ||
      value === "application"
    );
  }

  async function callAgent(currentMessages: Message[]) {
    if (!exam || !mistake) return;
    setIsAgentLoading(true);

    const relevantTopic = topics.find((t) => t.id === mistake.topicId);
    const topicMaterials: {
      topicName: string;
      notes: string;
      pastQuestions: string;
    }[] = [];
    if (relevantTopic) {
      const topicNotes = relevantTopic.notes.trim();
      const topicPastQuestions = relevantTopic.pastQuestions.trim();
      if (topicNotes || topicPastQuestions) {
        topicMaterials.push({
          topicName: mistake.topicName,
          notes: topicNotes,
          pastQuestions: topicPastQuestions,
        });
      }
    }

    try {
      let apiMessages = currentMessages.slice(-10).map((m) => ({
        role: m.role === "agent" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

      while (apiMessages.length > 0 && apiMessages[0].role === "assistant") {
        apiMessages = apiMessages.slice(1);
      }

      if (apiMessages.length === 0) {
        apiMessages = [
          {
            role: "user",
            content: "Start the review with one question.",
          },
        ];
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            context: {
              subject: exam.subject,
              examDate: exam.examDate,
              daysRemaining: daysUntilExam(exam.examDate),
              notes: exam.notes,
              pastQuestions: exam.pastQuestions,
              todayTopicNames: [mistake.topicName],
              mode: "review",
              topicMaterials,
              mistakeContext: {
                originalQuestion: mistake.question,
                studentAnswer: mistake.studentAnswer,
                correctApproach: mistake.correctApproach,
                mistakeCategory: mistake.mistakeCategory,
                topicName: mistake.topicName,
              },
            },
          }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("API failed");
        const data: unknown = await response.json();
        if (!isReviewApiResponse(data)) throw new Error("Invalid response");

        const agentMessage: Message = {
          id: generateId(),
          role: "agent",
          content: data.reply,
          mode: "review",
          flaggedMistake: data.flaggedMistake,
          timestamp: new Date().toISOString(),
        };

        const nextMessages = [...currentMessages, agentMessage];
        messagesRef.current = nextMessages;
        setMessages(nextMessages);

        if (data.resolved) {
          markReviewed(mistake.id);
          setIsResolved(true);
        }
      } catch {
        const fallback = getMockAgentReply({
          mode: "review",
          topicNames: [mistake.topicName],
          lastUserMessage: null,
          actionInstruction: null,
          messageCount: currentMessages.length,
        });
        const nextMessages = [...currentMessages, fallback];
        messagesRef.current = nextMessages;
        setMessages(nextMessages);
      } finally {
        clearTimeout(timeoutId);
      }
    } finally {
      setIsAgentLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoaded || !exam || !mistake) return;
    if (hasOpenedRef.current) return;
    hasOpenedRef.current = true;
    callAgent([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, exam, mistake]);

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || isAgentLoading || isResolved) return;
    setInputValue("");

    const studentMessage: Message = {
      id: generateId(),
      role: "student",
      content: trimmed,
      mode: "review",
      flaggedMistake: false,
      timestamp: new Date().toISOString(),
    };

    const withStudent = [...messagesRef.current, studentMessage];
    messagesRef.current = withStudent;
    setMessages(withStudent);

    await callAgent(withStudent);
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading...</p>
      </main>
    );
  }

  if (!mistakeId || !mistake) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm text-neutral-600 mb-4">
            {!mistakeId ? "No mistake ID provided." : "Mistake not found."}
          </p>
          <Link
            href="/mistakes"
            className="inline-block bg-black text-white text-sm px-4 py-2 rounded hover:bg-neutral-800"
          >
            Back to Mistake Bank
          </Link>
        </div>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm text-neutral-600 mb-4">Exam setup is missing.</p>
          <Link
            href="/setup"
            className="inline-block bg-black text-white text-sm px-4 py-2 rounded hover:bg-neutral-800"
          >
            Go to setup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-white">
      <div className="border-b border-neutral-200 px-4 py-3 flex items-center justify-between shrink-0">
        <Link
          href="/mistakes"
          className="text-sm text-neutral-500 underline hover:text-black"
        >
          ← Back to mistakes
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
            {mistake.topicName}
          </span>
          <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
            {mistake.mistakeCategory}
          </span>
        </div>
      </div>

      <MessageThread messages={messages} />

      {isAgentLoading && (
        <p className="text-sm text-neutral-500 text-center py-2 shrink-0">
          Coach is thinking...
        </p>
      )}

      <div className="border-t border-neutral-200 px-4 py-3 space-y-3 shrink-0">
        {isResolved ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-neutral-600">
              You fixed this. Mistake marked as reviewed.
            </p>
            <Link
              href="/mistakes"
              className="inline-block text-sm underline text-neutral-500 hover:text-black"
            >
              Back to Mistake Bank
            </Link>
          </div>
        ) : (
          <>
            <SessionInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSend}
              disabled={isAgentLoading}
            />
            <button
              type="button"
              onClick={() => router.push("/mistakes")}
              className="w-full border border-neutral-300 text-sm py-2 rounded hover:border-black transition-colors"
            >
              End review
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-neutral-600">Loading...</p>
        </main>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
