"use client";

import { useState } from "react";
import { useFounder } from "@/hooks/useFounder";
import {
  DuButton,
  DuCard,
  DuEmpty,
  DuShell,
  DuTag,
  Eyebrow,
  SectionTitle,
} from "@/components/du/ui";
import {
  getFounderState,
  saveFounderState,
  saveLessonReflection,
} from "@/lib/du/storage";
import {
  createInitialFounderState,
  markReflectionComplete,
} from "@/lib/du/progress";

export default function FeedbackPage() {
  const { ready, profile, feedforward, state, refresh } = useFounder();
  const [reflection, setReflection] = useState("");
  const [reflected, setReflected] = useState(false);

  if (!ready) {
    return (
      <DuShell>
        <DuCard>Loading your feed-forward…</DuCard>
      </DuShell>
    );
  }

  if (!feedforward) {
    return (
      <DuShell>
        <DuEmpty
          title="No feed-forward yet"
          description="Build your Effectuation Roadmap in the Venture Studio and generate your first report. It's feed-forward, not a grade — direct, founder-to-founder."
          action={
            <DuButton href="/module/effectuation/studio" variant="primary">
              Open Venture Studio
            </DuButton>
          }
        />
      </DuShell>
    );
  }

  const alreadyReflected =
    state?.progressState === "reflection_complete" ||
    state?.progressState === "ready_for_mentor_review" ||
    state?.progressState === "module_complete";

  function handleReflect() {
    saveLessonReflection("module-reflection", reflection.trim());
    const prev = getFounderState() ?? createInitialFounderState(profile?.id ?? "anonymous");
    saveFounderState(markReflectionComplete(prev));
    setReflected(true);
    refresh();
  }

  return (
    <DuShell>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <DuTag tone="accent">Feed-forward, not grading</DuTag>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#A8A296]">
          No scores · No pass/fail · Just what to build next
        </span>
      </div>

      <SectionTitle
        eyebrow="Effectuation Roadmap · Feed-forward"
        title={profile ? `${profile.ventureName} — what to build next` : "What to build next"}
      />

      <DuCard tone="ink" className="mb-6">
        <Eyebrow onDark>Summary</Eyebrow>
        <p className="mt-3 text-lg font-semibold leading-relaxed text-white">
          {feedforward.summary}
        </p>
        <div className="mt-5 rounded-lg bg-[#F5D11E] p-4 text-[#0B0B0C]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
            Your next concrete action
          </p>
          <p className="mt-1.5 text-[15px] font-semibold leading-relaxed">
            {feedforward.nextAction}
          </p>
        </div>
      </DuCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <ReportList
          eyebrow="Strengths"
          title="What's working"
          items={feedforward.strengths}
          marker="#137333"
        />
        <ReportList
          eyebrow="Concept connections"
          title="Effectuation in your work"
          items={feedforward.conceptConnections}
          marker="#F5D11E"
        />
        <ReportList
          eyebrow="Unclear areas"
          title="Sharpen these"
          items={feedforward.unclearAreas}
          marker="#9A6700"
        />
        <ReportList
          eyebrow="Unsupported assumptions"
          title="Prove or kill these"
          items={feedforward.unsupportedAssumptions}
          marker="#B42318"
        />
        <ReportList
          eyebrow="A mentor would ask"
          title="Questions to answer"
          items={feedforward.mentorQuestions}
          marker="#0B0B0C"
        />
        <ReportList
          eyebrow="Improvement steps"
          title="How to move forward"
          items={feedforward.improvementSteps}
          marker="#0B0B0C"
        />
      </div>

      {/* Reflection */}
      <DuCard className="mt-6 border-2 border-[#F5D11E]">
        <Eyebrow>Reflect &amp; prepare for mentor review</Eyebrow>
        <h3 className="mt-2 text-xl font-black tracking-tight">
          What will you change before review?
        </h3>
        {alreadyReflected || reflected ? (
          <div className="mt-3 flex items-center gap-2">
            <DuTag tone="active">Reflection complete ✓</DuTag>
            <span className="text-sm text-[#56524B]">
              Your progress journey is updated.
            </span>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-[#56524B]">
              Name the one or two changes you&apos;ll make based on this
              feed-forward. This marks your reflection step complete.
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="The biggest thing I'll change before mentor review is…"
              className="mt-3 w-full rounded-lg border border-[#D8D2C2] bg-white px-4 py-3 text-sm text-[#0B0B0C] placeholder:text-[#A8A296] focus-visible:border-[#0B0B0C] focus-visible:outline-none"
            />
            <div className="mt-3">
              <DuButton
                variant="primary"
                onClick={handleReflect}
                disabled={!reflection.trim()}
              >
                Mark reflection complete
              </DuButton>
            </div>
          </>
        )}
      </DuCard>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap gap-3">
        <DuButton href="/module/effectuation/studio" variant="outline">
          Revise in Studio
        </DuButton>
        <DuButton href="/mentor" variant="primary">
          Ask Mentor
        </DuButton>
        <DuButton href="/progress" variant="accent">
          View Progress →
        </DuButton>
      </div>
    </DuShell>
  );
}

function ReportList({
  eyebrow,
  title,
  items,
  marker,
}: {
  eyebrow: string;
  title: string;
  items: string[];
  marker: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <DuCard>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="mt-1.5 text-lg font-black tracking-tight">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-[#3A372F]">
            <span
              aria-hidden
              className="mt-[7px] h-2 w-2 shrink-0 rotate-45"
              style={{ background: marker }}
            />
            {item}
          </li>
        ))}
      </ul>
    </DuCard>
  );
}
