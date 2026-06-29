"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFounder } from "@/hooks/useFounder";
import {
  DuButton,
  DuCard,
  DuShell,
  DuTag,
  Eyebrow,
  SectionTitle,
} from "@/components/du/ui";
import {
  EFFECTUATION_MODULE,
  EFFECTUATION_SECTION_IDS,
} from "@/data/unknown/effectuation";
import {
  appendRevision,
  duGenerateId,
  getFounderState,
  nowIso,
  saveFounderProfile,
  saveFounderState,
  saveLatestFeedForward,
  saveSubmission,
} from "@/lib/du/storage";
import {
  applyFeedForwardToState,
  createInitialFounderState,
  deriveSubmissionCompleteness,
  revisionLabel,
} from "@/lib/du/progress";
import { DEMO_SECTIONS, DEMO_VENTURE } from "@/lib/du/demo";
import type {
  AssignmentRevision,
  AssignmentSubmission,
  FeedForwardResult,
  FounderProfile,
  VentureStage,
} from "@/lib/du/types";

const STAGES: VentureStage[] = ["idea", "validation", "building", "launched"];

const inputClass =
  "w-full rounded-lg border border-[#D8D2C2] bg-white px-4 py-2.5 text-sm text-[#0B0B0C] placeholder:text-[#A8A296] focus-visible:border-[#0B0B0C] focus-visible:outline-none";

export default function VentureStudioPage() {
  const router = useRouter();
  const { ready, profile, submission, feedforward, revisions, refresh } =
    useFounder();

  // Profile form state.
  const [ventureName, setVentureName] = useState("");
  const [idea, setIdea] = useState("");
  const [stage, setStage] = useState<VentureStage>("idea");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [goalsText, setGoalsText] = useState("");

  // Assignment section answers.
  const [sections, setSections] = useState<Record<string, string>>({});

  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate the form from storage once (don't clobber edits on later refreshes).
  useEffect(() => {
    if (!ready || hydrated) return;
    if (profile) {
      setVentureName(profile.ventureName);
      setIdea(profile.idea);
      setStage(profile.stage);
      setTargetCustomer(profile.targetCustomer ?? "");
      setCurrentChallenge(profile.currentChallenge ?? "");
      setGoalsText((profile.goals ?? []).join("\n"));
    }
    if (submission) setSections(submission.sections);
    setHydrated(true);
  }, [ready, hydrated, profile, submission]);

  const completeness = deriveSubmissionCompleteness(
    { sections } as AssignmentSubmission,
    EFFECTUATION_SECTION_IDS,
  );

  function buildProfile(): FounderProfile {
    return {
      id: profile?.id ?? duGenerateId(),
      ventureName: ventureName.trim() || "Untitled venture",
      idea: idea.trim(),
      stage,
      targetCustomer: targetCustomer.trim() || undefined,
      currentChallenge: currentChallenge.trim() || undefined,
      goals: goalsText
        .split("\n")
        .map((g) => g.trim())
        .filter(Boolean),
      createdAt: profile?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
  }

  function buildSubmission(profileId: string): AssignmentSubmission {
    return {
      id: submission?.id ?? duGenerateId(),
      moduleId: EFFECTUATION_MODULE.id,
      founderProfileId: profileId,
      sections,
      createdAt: submission?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
  }

  function persist(): { profile: FounderProfile; submission: AssignmentSubmission } {
    const nextProfile = buildProfile();
    saveFounderProfile(nextProfile);
    const nextSubmission = buildSubmission(nextProfile.id);
    saveSubmission(nextSubmission);
    return { profile: nextProfile, submission: nextSubmission };
  }

  function handleUseDemoVenture() {
    setVentureName(DEMO_VENTURE.ventureName);
    setIdea(DEMO_VENTURE.idea);
    setStage(DEMO_VENTURE.stage);
    setTargetCustomer(DEMO_VENTURE.targetCustomer);
    setCurrentChallenge(DEMO_VENTURE.currentChallenge);
    setGoalsText(DEMO_VENTURE.goals.join("\n"));
    setSections({ ...DEMO_SECTIONS });
    setHydrated(true);
    setError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleSaveDraft() {
    persist();
    setSavedAt(nowIso());
    setError(null);
    refresh();
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const { profile: savedProfile, submission: savedSubmission } = persist();
    setSavedAt(nowIso());

    // This generation produces a new draft. Draft # = prior revisions + 1.
    const draftNumber = revisions.length + 1;

    try {
      const res = await fetch("/api/feedforward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderProfile: savedProfile,
          submission: savedSubmission,
          moduleContext: {
            moduleTitle: EFFECTUATION_MODULE.title,
            assignmentTitle: EFFECTUATION_MODULE.assignmentTitle,
            sections: EFFECTUATION_MODULE.assignmentSections.map((s) => ({
              id: s.id,
              prompt: s.prompt,
            })),
          },
          draftNumber,
          previousFeedForwardReport: feedforward
            ? {
                summary: feedforward.summary,
                nextAction: feedforward.nextAction,
                unsupportedAssumptions: feedforward.unsupportedAssumptions,
                improvementSteps: feedforward.improvementSteps,
              }
            : undefined,
          revisionHistory: revisions.map((r) => ({
            revisionNote: r.revisionNote,
            feedbackSummary: r.feedbackSummary,
          })),
        }),
      });

      if (!res.ok) throw new Error("feedforward_failed");
      const result = (await res.json()) as FeedForwardResult;

      const report = {
        id: duGenerateId(),
        submissionId: savedSubmission.id,
        ...result,
        createdAt: nowIso(),
      };
      saveLatestFeedForward(report);

      // Snapshot this draft into the revision history.
      const revision: AssignmentRevision = {
        id: duGenerateId(),
        submissionId: savedSubmission.id,
        moduleId: EFFECTUATION_MODULE.id,
        founderProfileId: savedProfile.id,
        sections: { ...savedSubmission.sections },
        feedbackReportId: report.id,
        feedbackSummary: result.summary,
        createdAt: nowIso(),
        revisionNote: `Draft ${draftNumber}`,
      };
      appendRevision(revision);

      // Advance the founder's journey from the report.
      const prevState =
        getFounderState() ?? createInitialFounderState(savedProfile.id);
      const completenessNow = deriveSubmissionCompleteness(
        savedSubmission,
        EFFECTUATION_SECTION_IDS,
      );
      saveFounderState(
        applyFeedForwardToState(prevState, result, completenessNow),
      );

      refresh();
      router.push("/module/effectuation/feedback");
    } catch {
      setError(
        "Couldn't generate feed-forward just now. Your draft is saved — try again in a moment.",
      );
      setGenerating(false);
    }
  }

  return (
    <DuShell>
      <SectionTitle
        eyebrow="Effectuation Roadmap · Venture Studio"
        title={EFFECTUATION_MODULE.assignmentTitle}
        description="Apply effectuation to your own venture. Fill what you can — thin sections are fine to start, but the more real detail you give, the sharper your feed-forward."
        action={
          <DuTag tone={completeness.isStrong ? "accent" : "neutral"}>
            {completeness.filled}/{completeness.total} sections
          </DuTag>
        }
      />

      {/* Onboarding — only before a venture exists */}
      {ready && !profile ? (
        <DuCard tone="ink" className="mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Eyebrow onDark>Founder onboarding</Eyebrow>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Start with your venture.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Everything on campus — the AI Mentor, your feed-forward, your
                progress journey — reasons about the company you&apos;re actually
                building. Fill the profile below, or drop in a demo venture to see
                the full journey instantly.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <DuButton variant="accent" onClick={handleUseDemoVenture}>
                Use demo venture
              </DuButton>
              <span className="text-center text-[11px] text-white/45">
                Pre-fills a complete roadmap
              </span>
            </div>
          </div>
        </DuCard>
      ) : null}

      {/* Venture profile */}
      <DuCard className="mb-6">
        <Eyebrow>Venture profile</Eyebrow>
        <h3 className="mt-2 text-xl font-black tracking-tight">
          Who&apos;s building, and what
        </h3>
        <p className="mt-1 text-sm text-[#56524B]">
          The whole campus — mentor and feed-forward — reasons about this.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Venture name">
            <input
              className={inputClass}
              value={ventureName}
              onChange={(e) => setVentureName(e.target.value)}
              placeholder="e.g. Northwind Tools"
            />
          </Field>
          <Field label="Stage">
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                    stage === s
                      ? "bg-[#0B0B0C] text-[#F5D11E]"
                      : "bg-[#EDE8DA] text-[#56524B] hover:bg-[#E2DCCD]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Your idea" full>
            <textarea
              className={inputClass}
              rows={2}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="In one or two sentences, what are you building and for whom?"
            />
          </Field>
          <Field label="Target customer">
            <input
              className={inputClass}
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              placeholder="Who feels the problem most?"
            />
          </Field>
          <Field label="Current challenge">
            <input
              className={inputClass}
              value={currentChallenge}
              onChange={(e) => setCurrentChallenge(e.target.value)}
              placeholder="What's the thing slowing you down right now?"
            />
          </Field>
          <Field label="Goals (one per line)" full>
            <textarea
              className={inputClass}
              rows={2}
              value={goalsText}
              onChange={(e) => setGoalsText(e.target.value)}
              placeholder={"Talk to 5 potential customers\nShip a landing page test"}
            />
          </Field>
        </div>
      </DuCard>

      {/* Assignment sections */}
      <div className="space-y-4">
        {EFFECTUATION_MODULE.assignmentSections.map((s, i) => {
          const value = sections[s.id] ?? "";
          const filled = value.trim().length > 0;
          return (
            <DuCard key={s.id}>
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center text-sm font-black ${
                    filled
                      ? "bg-[#0B0B0C] text-[#F5D11E]"
                      : "bg-[#EDE8DA] text-[#8A8579]"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <label className="text-base font-black tracking-tight text-[#0B0B0C]">
                    {s.prompt}
                  </label>
                  {s.helper ? (
                    <p className="mt-1 text-sm text-[#6B675D]">{s.helper}</p>
                  ) : null}
                  <textarea
                    className={`${inputClass} mt-3`}
                    rows={3}
                    value={value}
                    onChange={(e) =>
                      setSections((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                    placeholder="Write your answer for this venture…"
                  />
                </div>
              </div>
            </DuCard>
          );
        })}
      </div>

      {/* Revision history */}
      {revisions.length > 0 ? (
        <DuCard className="mt-6">
          <Eyebrow>Revision history</Eyebrow>
          <h3 className="mt-2 text-lg font-black tracking-tight">
            How your roadmap has evolved
          </h3>
          <p className="mt-1 text-sm text-[#56524B]">
            Each draft is snapshotted when you generate feed-forward.
          </p>
          <ol className="mt-4 space-y-3">
            {revisions
              .slice()
              .reverse()
              .map((rev, i) => {
                const realIndex = revisions.length - 1 - i;
                const label = revisionLabel(realIndex, revisions.length);
                const filledCount = Object.values(rev.sections).filter((v) =>
                  (v || "").trim(),
                ).length;
                return (
                  <li
                    key={rev.id}
                    className="flex gap-4 rounded-lg border border-[#E2DCCD] bg-white p-4"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center text-xs font-black ${
                        realIndex === revisions.length - 1
                          ? "bg-[#F5D11E] text-[#0B0B0C]"
                          : "bg-[#EDE8DA] text-[#56524B]"
                      }`}
                    >
                      {realIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black tracking-tight text-[#0B0B0C]">
                          {label}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8A296]">
                          {formatDate(rev.createdAt)} · {filledCount}/
                          {EFFECTUATION_SECTION_IDS.length} sections
                        </span>
                      </div>
                      {rev.feedbackSummary ? (
                        <p className="mt-1 text-sm leading-relaxed text-[#56524B]">
                          {rev.feedbackSummary}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
          </ol>
        </DuCard>
      ) : ready && (profile || completeness.filled > 0) ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#D8D2C2] bg-white px-5 py-5">
          <Eyebrow>Revision history</Eyebrow>
          <p className="mt-2 text-sm text-[#56524B]">
            Your drafts will appear here after each feed-forward cycle. Generate
            feed-forward and we&apos;ll snapshot this working draft as Draft 1.
          </p>
        </div>
      ) : null}

      {/* Action bar */}
      <div className="sticky bottom-4 z-10 mt-8">
        <DuCard tone="ink">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-white">
                {completeness.isStrong
                  ? "Looking strong — ready to generate feed-forward."
                  : "Save as you go. Generate whenever you're ready — feed-forward, not grading."}
              </p>
              {savedAt ? (
                <p className="mt-1 text-xs text-white/55">Draft saved.</p>
              ) : null}
              {error ? (
                <p className="mt-1 text-xs font-semibold text-[#F5D11E]">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <DuButton
                variant="outline"
                onClick={handleSaveDraft}
                className="border-white/30 text-white hover:bg-white hover:text-[#0B0B0C]"
              >
                Save draft
              </DuButton>
              <DuButton
                variant="accent"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? "Generating…" : "Generate feed-forward →"}
              </DuButton>
            </div>
          </div>
        </DuCard>
      </div>
    </DuShell>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B675D]">
        {label}
      </p>
      {children}
    </div>
  );
}
