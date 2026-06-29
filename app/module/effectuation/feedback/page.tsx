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
import { EFFECTUATION_SECTION_IDS } from "@/data/unknown/effectuation";
import {
  getFounderState,
  saveFounderState,
  saveLessonReflection,
} from "@/lib/du/storage";
import {
  createInitialFounderState,
  deriveReviewStatus,
  deriveSubmissionCompleteness,
  markReflectionComplete,
} from "@/lib/du/progress";
import type { AssignmentRevision } from "@/lib/du/types";

const REVIEW_TONE: Record<
  string,
  { tone: "neutral" | "active" | "accent" | "locked"; ring: string }
> = {
  ready: { tone: "active", ring: "border-[#137333]" },
  approaching: { tone: "accent", ring: "border-[#F5D11E]" },
  revision: { tone: "neutral", ring: "border-[#B42318]" },
  building: { tone: "neutral", ring: "border-[#E2DCCD]" },
};

export default function FeedbackPage() {
  const { ready, profile, submission, feedforward, state, revisions, refresh } =
    useFounder();
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

  const completeness = deriveSubmissionCompleteness(
    submission,
    EFFECTUATION_SECTION_IDS,
  );
  const review = deriveReviewStatus(state, completeness);
  const reviewStyle = REVIEW_TONE[review.status] ?? REVIEW_TONE.building;
  const draftNumber = revisions.length || 1;
  const changeNote = describeChange(revisions);
  const revisionFocus = feedforward.improvementSteps[0];

  const alreadyReflected =
    state?.progressState === "reflection_complete" ||
    state?.progressState === "ready_for_mentor_review" ||
    state?.progressState === "module_complete";

  function handleReflect() {
    saveLessonReflection("module-reflection", reflection.trim());
    const prev =
      getFounderState() ?? createInitialFounderState(profile?.id ?? "anonymous");
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
        eyebrow={`Effectuation Roadmap · Review Room · Draft ${draftNumber}`}
        title={
          profile ? `${profile.ventureName} — what to build next` : "What to build next"
        }
      />

      {/* Summary + next action */}
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

      {/* Review-room status row: distance, what changed, revision focus */}
      <div className="mb-6 grid gap-5 lg:grid-cols-3">
        <DuCard className={`border-2 ${reviewStyle.ring}`}>
          <Eyebrow>Distance to mentor review</Eyebrow>
          <div className="mt-2">
            <DuTag tone={reviewStyle.tone}>{review.label}</DuTag>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#3A372F]">
            {review.detail}
          </p>
          <p className="mt-3 text-xs text-[#8A8579]">
            {completeness.filled}/{completeness.total} roadmap sections built.
          </p>
        </DuCard>

        <DuCard>
          <Eyebrow>What changed since last draft</Eyebrow>
          <p className="mt-3 text-sm leading-relaxed text-[#3A372F]">
            {changeNote}
          </p>
          {revisions.length > 1 ? (
            <p className="mt-3 text-xs text-[#8A8579]">
              {revisions.length} drafts saved. Full history lives in the Studio.
            </p>
          ) : null}
        </DuCard>

        <DuCard tone="yellow">
          <Eyebrow>Revision focus</Eyebrow>
          <h3 className="mt-2 text-base font-black tracking-tight text-[#0B0B0C]">
            Your strongest priority
          </h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[#0B0B0C]">
            {revisionFocus ??
              "Tighten one section with a real, specific commitment or experiment."}
          </p>
        </DuCard>
      </div>

      {/* Full report */}
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
          title="How to move forward (priority first)"
          items={feedforward.improvementSteps}
          marker="#0B0B0C"
        />
      </div>

      {/* Grounded in module knowledge (Knowledge Brain sources) */}
      {feedforward.sources && feedforward.sources.length > 0 ? (
        <div className="mt-6 rounded-xl border border-[#E2DCCD] bg-[#F8F6EF] px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B675D]">
              Grounded in module knowledge
            </span>
            <span className="text-xs text-[#8A8579]">
              {feedforward.sources.map((s) => s.label).join(" · ")}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-[#8A8579]">
            This feed-forward is grounded in the Unknown Knowledge Brain — curated
            module knowledge, not a grade.
          </p>
        </div>
      ) : null}

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

      {/* Prepare for human mentor */}
      <DuCard tone="ink" className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow onDark>Human mentor review</Eyebrow>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              This feed-forward complements — it never replaces — a human mentor.
              Walk into that session further along: bring your sharpest experiment
              and the assumption you most need a second opinion on.
            </p>
          </div>
          <DuButton href="/mentor" variant="accent">
            Prepare for human mentor →
          </DuButton>
        </div>
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

/**
 * Lightweight "what changed" heuristic — compares the two most recent draft
 * snapshots by how many sections carry real content. No full diffing yet.
 */
function describeChange(revisions: AssignmentRevision[]): string {
  if (revisions.length <= 1) {
    return "This is your first draft — your baseline. Generate feed-forward again after revising and you'll see exactly what moved.";
  }
  const current = revisions[revisions.length - 1];
  const previous = revisions[revisions.length - 2];
  const count = (r: AssignmentRevision) =>
    Object.values(r.sections).filter((v) => (v || "").trim()).length;
  const delta = count(current) - count(previous);
  if (delta > 0) {
    return `You built out ${delta} more section${delta === 1 ? "" : "s"} than your previous draft. The roadmap is getting more complete — keep deepening the thin spots.`;
  }
  if (delta < 0) {
    return "You trimmed back from the last draft. Make sure every cut was deliberate, not an unfinished section.";
  }
  return "Same sections covered as last draft — so the change is in depth and sharpness. Check that your strongest priority actually moved.";
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
