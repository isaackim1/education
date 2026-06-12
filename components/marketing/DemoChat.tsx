"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

/**
 * DemoChat — a fully frontend-only, scripted preview of Ivvy's tutor.
 *
 * Prototype scope only:
 * - Does NOT call /api/agent (or any backend). Replies come from a small canned
 *   set matched by keyword, so a public landing page can never generate paid
 *   API requests.
 * - Free attempts are capped in local component state (DEMO_LIMIT). After the
 *   limit, the composer is replaced by a "create your workspace" gate.
 * - Input is length-capped (MAX_INPUT). Nothing persists across a refresh.
 */

const DEMO_LIMIT = 3;
const MAX_INPUT = 200;

const SUGGESTIONS = [
  "Explain marginal cost in simple terms.",
  "Quiz me on economies of scale.",
  "How should I review my mistakes?",
];

// Canned, scripted replies matched by simple keyword inclusion. Each one stays
// short and ends by pointing to the real workspace — this is only a preview.
const CANNED: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["marginal cost"],
    reply:
      "Marginal cost is the extra cost of producing one more unit — the change in total cost divided by the change in quantity. If 10 chairs cost $200 and 11 cost $215, the marginal cost of that 11th chair is $15. In the full workspace I'd quiz you on it until it sticks.",
  },
  {
    keywords: ["economies of scale", "economy of scale"],
    reply:
      "Quick check: economies of scale mean average cost per unit falls as output rises. Name one internal source (e.g. bulk buying or specialised labour) and one external source. In the full tutor I'd grade your answer and follow up on the gaps.",
  },
  {
    keywords: ["opportunity cost"],
    reply:
      "Opportunity cost is the value of the next-best option you give up when you choose. Spend an hour on one topic and its opportunity cost is the topic you didn't study. The full workspace tutors this against your own materials.",
  },
  {
    keywords: ["mistake", "review", "wrong"],
    reply:
      "When you train, Ivvy flags answers it judges incorrect and saves them to your mistake bank. You review them later with active recall — try the question again before seeing the better approach — and Ivvy resurfaces them until they're closed. Create a workspace to start building yours.",
  },
  {
    keywords: ["essay", "structure", "answer plan"],
    reply:
      "For a strong exam essay: state your argument in one sentence, support it with two or three points (each with evidence), address one counterpoint, then conclude by linking back to the question. The full workspace can drill this on your past papers.",
  },
  {
    keywords: ["supply", "demand"],
    reply:
      "Supply and demand set price where the two curves meet. More demand or less supply pushes price up; less demand or more supply pushes it down. In your workspace I'd ground this in your own notes and quiz you on shifts versus movements.",
  },
];

const GENERIC_REPLY =
  "Here's the short version: I'd explain the core idea, show one concrete example, then quiz you until it sticks. This is just a scripted preview — create your workspace and I'll train you on your own materials, properly.";

function cannedReply(question: string): string {
  const q = question.toLowerCase();
  for (const entry of CANNED) {
    if (entry.keywords.some((keyword) => q.includes(keyword))) {
      return entry.reply;
    }
  }
  return GENERIC_REPLY;
}

type DemoMessage = { role: "user" | "assistant"; content: string };

export default function DemoChat() {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const limitReached = attempts >= DEMO_LIMIT;
  const remaining = Math.max(0, DEMO_LIMIT - attempts);

  function ask(question: string) {
    const trimmed = question.trim().slice(0, MAX_INPUT);
    if (!trimmed || isSending || limitReached) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setIsSending(true);
    setAttempts((count) => count + 1);

    // Brief, scripted "thinking" pause — no network request is made.
    const reply = cannedReply(trimmed);
    timerRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
      setIsSending(false);
    }, 450);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div className="rounded-2xl border border-[#E7E3DA] bg-white p-5 shadow-[0_1px_0_rgba(26,26,23,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]">
          Scripted tutor preview
        </p>
        <span className="inline-flex items-center rounded-full bg-[#F4F1EA] px-2.5 py-1 text-xs font-medium text-[#56524B]">
          {limitReached ? "Demo complete" : `${remaining} free left`}
        </span>
      </div>

      {/* Transcript */}
      <div
        className="mt-4 max-h-[20rem] space-y-3 overflow-y-auto"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="rounded-xl border border-[#E7E3DA] bg-[#FAF8F4] px-4 py-5">
            <p className="text-sm leading-relaxed text-[#56524B]">
              A quick scripted preview of how Ivvy explains and trains — no
              sign-up. Try one of these:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  disabled={isSending || limitReached}
                  className="rounded-full border border-[#D8D3C8] bg-white px-3 py-1.5 text-xs font-medium text-[#1A1A17] transition-colors duration-200 hover:bg-[#EFEBE2] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[#1A1A17] text-white"
                    : "border border-[#E7E3DA] bg-[#FAF8F4] text-[#1A1A17]"
                }`}
              >
                {message.role === "assistant" ? (
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A766D]">
                    Ivvy
                  </span>
                ) : null}
                {message.content}
              </div>
            </div>
          ))
        )}
        {isSending ? (
          <p className="text-xs text-[#7A766D]" role="status">
            Ivvy is thinking…
          </p>
        ) : null}
      </div>

      {/* Composer or gate */}
      {limitReached ? (
        <div className="mt-4 rounded-xl border border-[#D8D3C8] bg-[#FAF8F4] px-4 py-4 text-center">
          <p className="text-sm font-medium text-[#1A1A17]">
            Create your workspace to keep training.
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-[#56524B]">
            This preview is scripted. The full tutor trains you on your own
            materials, saves your mistakes, and tracks your readiness.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#1A1A17] px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
          >
            Create your workspace
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <label htmlFor="demo-input" className="sr-only">
            Ask Ivvy a study question
          </label>
          <input
            id="demo-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isSending}
            maxLength={MAX_INPUT}
            placeholder="Ask Ivvy: Explain marginal cost in simple terms."
            className="h-11 flex-1 rounded-full border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#9B968D] transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isSending || input.trim().length === 0}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#1A1A17] px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Ask
          </button>
        </form>
      )}
    </div>
  );
}
