"use client";

import { useEffect, useRef, useState } from "react";
import { useFounder } from "@/hooks/useFounder";
import {
  DuButton,
  DuCard,
  DuShell,
  DuTag,
  Eyebrow,
} from "@/components/du/ui";
import { EFFECTUATION_MODULE } from "@/data/unknown/effectuation";
import {
  clearMentorThread,
  duGenerateId,
  nowIso,
  saveMentorThread,
} from "@/lib/du/storage";
import type { MentorMessage, MentorResult } from "@/lib/du/types";

const QUICK_PROMPTS = [
  "Help me improve my roadmap",
  "Challenge my assumptions",
  "Prepare me for mentor review",
  "Explain affordable loss for my venture",
  "What should I do next this week?",
];

export default function MentorPage() {
  const { ready, profile, feedforward, state, mentorThread } = useFounder();
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  // Load the persisted thread once storage is ready; seed a context-aware
  // greeting (and persist it) only if there's no prior conversation.
  useEffect(() => {
    if (!ready || loaded.current) return;
    loaded.current = true;
    if (mentorThread.length > 0) {
      setMessages(mentorThread);
    } else {
      const greeting: MentorMessage = {
        id: duGenerateId(),
        role: "mentor",
        content: buildGreeting(profile?.ventureName, profile?.currentChallenge),
        createdAt: nowIso(),
      };
      setMessages([greeting]);
      saveMentorThread([greeting]);
    }
  }, [ready, mentorThread, profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending]);

  function persist(next: MentorMessage[]) {
    setMessages(next);
    saveMentorThread(next);
  }

  function handleReset() {
    clearMentorThread();
    const greeting: MentorMessage = {
      id: duGenerateId(),
      role: "mentor",
      content: buildGreeting(profile?.ventureName, profile?.currentChallenge),
      createdAt: nowIso(),
    };
    persist([greeting]);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: MentorMessage = {
      id: duGenerateId(),
      role: "founder",
      content: trimmed,
      createdAt: nowIso(),
    };
    const withUser = [...messages, userMsg];
    persist(withUser);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: withUser.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          founderProfile: profile ?? undefined,
          currentModule: {
            title: EFFECTUATION_MODULE.title,
            tagline: EFFECTUATION_MODULE.tagline,
          },
          currentStep: state?.currentStepId
            ? {
                title:
                  EFFECTUATION_MODULE.steps.find((s) => s.id === state.currentStepId)
                    ?.title ?? state.currentStepId,
              }
            : undefined,
          latestFeedForwardReport: feedforward
            ? {
                summary: feedforward.summary,
                nextAction: feedforward.nextAction,
                unsupportedAssumptions: feedforward.unsupportedAssumptions,
                mentorQuestions: feedforward.mentorQuestions,
              }
            : undefined,
        }),
      });

      const data = (await res.json()) as MentorResult & { error?: string };
      const reply =
        data.reply ??
        "I'm here — tell me what you're working on and I'll help you turn it into a concrete next step.";
      persist([
        ...withUser,
        {
          id: duGenerateId(),
          role: "mentor",
          content: reply,
          createdAt: nowIso(),
          suggestedNextAction: data.suggestedNextAction,
          suggestedQuestion: data.suggestedQuestion,
          sources: data.sources,
        },
      ]);
    } catch {
      persist([
        ...withUser,
        {
          id: duGenerateId(),
          role: "mentor",
          content:
            "I couldn't reach the campus just now. Try again in a moment — your venture context and our conversation are still here.",
          createdAt: nowIso(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const lastMentor = [...messages].reverse().find((m) => m.role === "mentor");
  const suggestion = {
    action: lastMentor?.suggestedNextAction,
    question: lastMentor?.suggestedQuestion,
  };
  const exchanges = messages.filter((m) => m.role === "founder").length;

  return (
    <DuShell width="max-w-4xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Eyebrow>Unknown · AI Mentor</Eyebrow>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Your 24/7 founder coach
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#56524B]">
            Module-aware and venture-aware, with memory of your conversation. Not
            a generic chatbot — a coach that pushes you toward one concrete next
            move.
          </p>
        </div>
        <div className="hidden flex-col items-end gap-2 sm:flex">
          <DuTag tone="active">● Online · remembers</DuTag>
          {exchanges > 0 ? (
            <button
              onClick={handleReset}
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8A296] underline underline-offset-2 hover:text-[#0B0B0C]"
            >
              Reset conversation
            </button>
          ) : null}
        </div>
      </div>

      {/* Quick prompts */}
      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={sending}
            className="rounded-full border border-[#D8D2C2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3A372F] transition-colors hover:border-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat surface */}
      <DuCard className="p-0">
        <div
          ref={scrollRef}
          className="max-h-[52vh] min-h-[320px] space-y-4 overflow-y-auto p-5 sm:p-6"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "founder" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "founder"
                    ? "bg-[#0B0B0C] text-white"
                    : "border border-[#E2DCCD] bg-[#F8F6EF] text-[#1F1D18]"
                }`}
              >
                {m.role === "mentor" ? (
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A8A296]">
                    AI Mentor
                  </p>
                ) : null}
                {m.content}
                {m.role === "mentor" && m.sources && m.sources.length > 0 ? (
                  <p className="mt-2.5 border-t border-[#E2DCCD] pt-2 text-[11px] text-[#8A8579]">
                    <span className="font-semibold text-[#6B675D]">
                      Grounded in:
                    </span>{" "}
                    {m.sources.map((s) => s.label).join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
          {sending ? (
            <div className="flex justify-start">
              <div className="rounded-xl border border-[#E2DCCD] bg-[#F8F6EF] px-4 py-3 text-sm text-[#8A8579]">
                Thinking…
              </div>
            </div>
          ) : null}
        </div>

        {(suggestion.action || suggestion.question) && !sending ? (
          <div className="border-t border-[#E2DCCD] bg-[#FBEFB8]/40 px-5 py-3 sm:px-6">
            {suggestion.action ? (
              <p className="text-xs text-[#3A372F]">
                <span className="font-bold uppercase tracking-[0.12em]">
                  Next action ·{" "}
                </span>
                {suggestion.action}
              </p>
            ) : null}
            {suggestion.question ? (
              <button
                onClick={() => send(suggestion.question as string)}
                className="mt-1 text-left text-xs font-semibold text-[#0B0B0C] underline underline-offset-2"
              >
                Ask: {suggestion.question}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Composer */}
        <div className="border-t border-[#E2DCCD] p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask your mentor about your venture…"
              className="min-h-[44px] flex-1 resize-none rounded-lg border border-[#D8D2C2] bg-white px-4 py-3 text-sm text-[#0B0B0C] placeholder:text-[#A8A296] focus-visible:border-[#0B0B0C] focus-visible:outline-none"
            />
            <DuButton type="submit" variant="accent" disabled={sending || !input.trim()}>
              Send
            </DuButton>
          </form>
        </div>
      </DuCard>

      <div className="mt-4 flex items-center justify-between gap-4">
        {ready && !profile ? (
          <p className="text-xs text-[#6B675D]">
            Tip: set up your venture in the{" "}
            <a
              href="/module/effectuation/studio"
              className="font-semibold underline underline-offset-2"
            >
              Venture Studio
            </a>{" "}
            to make every answer specific to what you&apos;re building.
          </p>
        ) : (
          <span />
        )}
        {exchanges > 0 ? (
          <button
            onClick={handleReset}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8A296] underline underline-offset-2 hover:text-[#0B0B0C] sm:hidden"
          >
            Reset conversation
          </button>
        ) : null}
      </div>
    </DuShell>
  );
}

function buildGreeting(ventureName?: string, challenge?: string): string {
  if (!ventureName) {
    return "Welcome to the campus. I'm your AI Mentor — a 24/7 founder coach for the Effectuation Roadmap module.\n\nSet up your venture in the Venture Studio and I'll make every answer specific to what you're building. In the meantime, ask me anything about effectuation, affordable loss, or finding your first customer.";
  }
  return `Good to see you building ${ventureName}. I'm your AI Mentor for the Effectuation Roadmap module — here to push you toward one concrete next move.${
    challenge ? `\n\nYou flagged "${challenge}" as your current challenge. Want to turn that into a small, affordable experiment this week?` : "\n\nWhere do you want to start — sharpening your roadmap, or pressure-testing an assumption?"
  }`;
}
