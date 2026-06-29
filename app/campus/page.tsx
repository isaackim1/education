"use client";

import Link from "next/link";
import { useFounder } from "@/hooks/useFounder";
import {
  DuButton,
  DuCard,
  DuProgressBar,
  DuShell,
  DuStat,
  DuTag,
  DuTickList,
  Eyebrow,
  SectionTitle,
} from "@/components/du/ui";
import {
  EFFECTUATION_MODULE,
  EFFECTUATION_SECTION_IDS,
  ENTREPRENEURSHIP_PROGRAM,
} from "@/data/unknown/effectuation";
import {
  deriveSubmissionCompleteness,
  moduleProgressPercent,
  progressStateLabel,
} from "@/lib/du/progress";

export default function CampusPage() {
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

  const nextAction = resolveNextAction(Boolean(profile), percent, state?.nextRecommendedAction);

  return (
    <DuShell>
      {/* Hero */}
      <DuCard tone="ink" className="overflow-hidden">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow onDark>Founder Campus · Entrepreneurship Foundations</Eyebrow>
            <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl">
              Step into the
              <br />
              <span className="bg-[#F5D11E] px-2 text-[#0B0B0C]">Unknown</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/70">
              This isn&apos;t a course you watch. It&apos;s a campus you build in.
              Follow applied modules, push every concept onto your own venture,
              submit work-in-progress, and get feed-forward — not grades — until
              you&apos;re ready for mentor review.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <DuButton href="/module/effectuation" variant="accent">
                Continue Module →
              </DuButton>
              <DuButton
                href="/module/effectuation/studio"
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-[#0B0B0C]"
              >
                Open Venture Studio
              </DuButton>
            </div>
          </div>

          <div className="shrink-0 lg:w-64">
            <div className="rounded-xl border border-white/12 bg-white/[0.04] p-5">
              <DuStat
                onDark
                label="Module progress"
                value={ready ? `${percent}%` : "—"}
                detail={
                  ready
                    ? state
                      ? progressStateLabel(state.progressState)
                      : "Not started yet"
                    : "Loading your campus…"
                }
              />
              <div className="mt-3">
                <DuProgressBar percent={ready ? percent : 0} onDark />
              </div>
            </div>
          </div>
        </div>
      </DuCard>

      {/* Program + module + next action */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <DuCard>
          <Eyebrow>Your program</Eyebrow>
          <h3 className="mt-2 text-xl font-black tracking-tight">
            {ENTREPRENEURSHIP_PROGRAM.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
            {ENTREPRENEURSHIP_PROGRAM.tagline}
          </p>
          <div className="mt-4">
            <DuTag tone="active">1 active · 6 ahead</DuTag>
          </div>
          <div className="mt-5">
            <Link
              href="/program"
              className="text-xs font-bold uppercase tracking-[0.12em] underline underline-offset-4 hover:text-[#6B675D]"
            >
              View program map →
            </Link>
          </div>
        </DuCard>

        <DuCard>
          <Eyebrow>Active module</Eyebrow>
          <h3 className="mt-2 text-xl font-black tracking-tight">
            {EFFECTUATION_MODULE.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
            {EFFECTUATION_MODULE.tagline}
          </p>
          <div className="mt-4">
            <DuProgressBar percent={ready ? percent : 0} />
            <p className="mt-2 text-xs text-[#6B675D]">
              {ready ? `${percent}% complete` : "Loading…"}
            </p>
          </div>
          <div className="mt-5">
            <Link
              href="/module/effectuation"
              className="text-xs font-bold uppercase tracking-[0.12em] underline underline-offset-4 hover:text-[#6B675D]"
            >
              Open module →
            </Link>
          </div>
        </DuCard>

        <DuCard tone="yellow">
          <Eyebrow>Next action</Eyebrow>
          <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[#0B0B0C]">
            {ready ? nextAction.text : "Loading your next move…"}
          </p>
          <div className="mt-5">
            <DuButton href={nextAction.href} variant="primary">
              {nextAction.cta}
            </DuButton>
          </div>
        </DuCard>
      </div>

      {/* Venture + feed-forward preview */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <DuCard>
          <SectionTitle
            eyebrow="Your venture"
            title={ready && profile ? profile.ventureName : "Set up your venture"}
          />
          {ready && profile ? (
            <>
              <p className="text-sm leading-relaxed text-[#3A372F]">
                {profile.idea}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <DuTag>Stage · {profile.stage}</DuTag>
                {profile.targetCustomer ? (
                  <DuTag>Customer · {profile.targetCustomer}</DuTag>
                ) : null}
              </div>
              <div className="mt-5">
                <DuButton href="/module/effectuation/studio" variant="outline">
                  Edit in Venture Studio
                </DuButton>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-[#56524B]">
                Everything on campus reasons about your venture. Create your
                founder profile to make the mentor and feed-forward personal to
                what you&apos;re building.
              </p>
              <div className="mt-5">
                <DuButton href="/module/effectuation/studio" variant="primary">
                  Create venture profile
                </DuButton>
              </div>
            </>
          )}
        </DuCard>

        <DuCard>
          <SectionTitle
            eyebrow="Latest feed-forward"
            title="What to build next"
          />
          {ready && feedforward ? (
            <>
              <p className="text-sm leading-relaxed text-[#3A372F]">
                {feedforward.summary}
              </p>
              {feedforward.strengths.length > 0 ? (
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B675D]">
                    Strengths
                  </p>
                  <div className="mt-2">
                    <DuTickList items={feedforward.strengths.slice(0, 2)} />
                  </div>
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <DuButton href="/module/effectuation/feedback" variant="outline">
                  View full report
                </DuButton>
              </div>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-[#56524B]">
              No feed-forward yet. Complete your Effectuation Roadmap in the
              Venture Studio and generate your first report — direct,
              founder-to-founder, never a grade.
            </p>
          )}
        </DuCard>
      </div>
    </DuShell>
  );
}

function resolveNextAction(
  hasProfile: boolean,
  percent: number,
  recommended?: string,
): { text: string; cta: string; href: string } {
  if (!hasProfile) {
    return {
      text: "Create your venture profile so the campus can reason about what you're actually building.",
      cta: "Start in Studio →",
      href: "/module/effectuation/studio",
    };
  }
  if (recommended) {
    return { text: recommended, cta: "Continue →", href: "/module/effectuation" };
  }
  if (percent < 40) {
    return {
      text: "Work through the Effectuation concepts and apply each one to your venture.",
      cta: "Continue learning →",
      href: "/module/effectuation/learn",
    };
  }
  return {
    text: "Build your Effectuation Roadmap and generate feed-forward before mentor review.",
    cta: "Open Venture Studio →",
    href: "/module/effectuation/studio",
  };
}
