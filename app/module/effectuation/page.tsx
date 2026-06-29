"use client";

import { useFounder } from "@/hooks/useFounder";
import {
  DuButton,
  DuCard,
  DuProgressBar,
  DuShell,
  DuTag,
  DuTickList,
  Eyebrow,
  SectionTitle,
} from "@/components/du/ui";
import {
  EFFECTUATION_MODULE,
  EFFECTUATION_SECTION_IDS,
} from "@/data/unknown/effectuation";
import {
  deriveSubmissionCompleteness,
  moduleProgressPercent,
  progressStateLabel,
} from "@/lib/du/progress";

export default function EffectuationModulePage() {
  const { ready, profile, submission, feedforward, state, reflections } =
    useFounder();

  const completeness = deriveSubmissionCompleteness(
    submission,
    EFFECTUATION_SECTION_IDS,
  );
  const reflectionsDone = EFFECTUATION_MODULE.conceptIds.filter((id) =>
    (reflections[id] ?? "").trim(),
  ).length;
  const percent = moduleProgressPercent({
    reflectionsCompleted: reflectionsDone,
    totalConcepts: EFFECTUATION_MODULE.conceptIds.length,
    completeness,
    state,
  });

  const learnStarted = reflectionsDone > 0;
  const hasDraft = completeness.filled > 0;

  return (
    <DuShell>
      <DuCard tone="ink" className="mb-8">
        <Eyebrow onDark>Module 01 · Active</Eyebrow>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          {EFFECTUATION_MODULE.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/75">
          {EFFECTUATION_MODULE.tagline}
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-md">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-white/60">
              <span>Progress</span>
              <span>{ready ? `${percent}%` : "—"}</span>
            </div>
            <DuProgressBar percent={ready ? percent : 0} onDark />
            <p className="mt-2 text-xs text-white/55">
              {ready && state
                ? progressStateLabel(state.progressState)
                : "Not started yet"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DuButton
              href="/module/effectuation/learn"
              variant="accent"
            >
              {learnStarted ? "Resume learning →" : "Start learning →"}
            </DuButton>
            <DuButton
              href="/module/effectuation/studio"
              variant="outline"
              className="border-white/30 text-white hover:bg-white hover:text-[#0B0B0C]"
            >
              {hasDraft ? "Open Venture Studio" : "Open Studio"}
            </DuButton>
          </div>
        </div>
      </DuCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <DuCard>
          <SectionTitle eyebrow="What you'll learn" title="The founder's logic" />
          <DuTickList items={EFFECTUATION_MODULE.willLearn} />
        </DuCard>
        <DuCard>
          <SectionTitle eyebrow="What you'll build" title="Real artifacts" />
          <DuTickList items={EFFECTUATION_MODULE.willBuild} />
        </DuCard>
      </div>

      <div className="mt-8">
        <SectionTitle eyebrow="Module steps" title="Ten steps, build the whole way" />
        <ol className="grid gap-2.5 sm:grid-cols-2">
          {EFFECTUATION_MODULE.steps.map((step) => {
            const current = ready && state?.currentStepId === step.id;
            return (
              <li key={step.id}>
                <div
                  className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 ${
                    current ? "border-[#0B0B0C]" : "border-[#E2DCCD]"
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#EDE8DA] text-xs font-black text-[#56524B]">
                    {step.order}
                  </span>
                  <span className="text-sm font-semibold text-[#3A372F]">
                    {step.title}
                  </span>
                  {current ? (
                    <span className="ml-auto">
                      <DuTag tone="accent">You&apos;re here</DuTag>
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <DuCard tone="yellow">
          <Eyebrow>Apply it</Eyebrow>
          <h3 className="mt-2 text-lg font-black tracking-tight">
            Venture Studio
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#0B0B0C]/80">
            Build your Effectuation Roadmap and submit it for feed-forward.
          </p>
          <div className="mt-4">
            <DuButton href="/module/effectuation/studio" variant="primary">
              Open Studio
            </DuButton>
          </div>
        </DuCard>
        <DuCard>
          <Eyebrow>Get unstuck</Eyebrow>
          <h3 className="mt-2 text-lg font-black tracking-tight">AI Mentor</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
            A 24/7 founder coach that knows your venture and this module.
          </p>
          <div className="mt-4">
            <DuButton href="/mentor" variant="outline">
              Ask mentor
            </DuButton>
          </div>
        </DuCard>
        <DuCard>
          <Eyebrow>Track it</Eyebrow>
          <h3 className="mt-2 text-lg font-black tracking-tight">
            Progress Journey
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
            See your strengths, risks, and readiness for mentor review.
          </p>
          <div className="mt-4">
            <DuButton href="/progress" variant="outline">
              View progress
            </DuButton>
          </div>
        </DuCard>
      </div>

      {ready && !profile ? (
        <div className="mt-8">
          <DuCard className="border-2 border-dashed border-[#D8D2C2]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[#3A372F]">
                You haven&apos;t set up your venture yet — the whole module gets
                sharper once you do.
              </p>
              <DuButton href="/module/effectuation/studio" variant="primary">
                Create venture profile
              </DuButton>
            </div>
          </DuCard>
        </div>
      ) : null}

      {ready && feedforward ? (
        <div className="mt-8">
          <DuCard tone="ink">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <Eyebrow onDark>Latest feed-forward</Eyebrow>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {feedforward.summary}
                </p>
              </div>
              <DuButton
                href="/module/effectuation/feedback"
                variant="accent"
              >
                View report →
              </DuButton>
            </div>
          </DuCard>
        </div>
      ) : null}
    </DuShell>
  );
}
