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
  resolveContinueRoute,
  type JourneyInputs,
} from "@/lib/du/progress";
import { seedDemoVenture } from "@/lib/du/demo";

interface ActivityEvent {
  at: string;
  label: string;
  href: string;
}

export default function CampusPage() {
  const {
    ready,
    profile,
    submission,
    feedforward,
    state,
    reflections,
    mentorThread,
    revisions,
    refresh,
  } = useFounder();

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

  const reflectionComplete =
    state?.progressState === "reflection_complete" ||
    state?.progressState === "ready_for_mentor_review" ||
    state?.progressState === "module_complete";

  const journeyInputs: JourneyInputs = {
    hasProfile: Boolean(profile),
    reflectionsCount: reflectionsDone,
    totalConcepts: EFFECTUATION_MODULE.conceptIds.length,
    submissionFilled: completeness.filled,
    hasFeedforward: Boolean(feedforward),
    revisionsCount: revisions.length,
    reflectionComplete,
    state,
  };
  const cont = resolveContinueRoute(journeyInputs);

  const lastMentor = [...mentorThread]
    .reverse()
    .find((m) => m.role === "mentor");
  const activity = buildActivity({
    profileCreatedAt: profile?.createdAt,
    ventureName: profile?.ventureName,
    feedforwardAt: feedforward?.createdAt,
    revisionCount: revisions.length,
    lastMentorAt: lastMentor?.createdAt,
  });

  function handleUseDemo() {
    seedDemoVenture();
    refresh();
  }

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
              <DuButton href={cont.href} variant="accent">
                {ready ? `Continue: ${cont.label} →` : "Continue →"}
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
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <DuStat
                  onDark
                  label="Revisions"
                  value={ready ? revisions.length : "—"}
                />
                <DuStat
                  onDark
                  label="Concepts"
                  value={ready ? `${reflectionsDone}/${EFFECTUATION_MODULE.conceptIds.length}` : "—"}
                />
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
          <Eyebrow>Next recommended action</Eyebrow>
          <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[#0B0B0C]">
            {ready
              ? state?.nextRecommendedAction ?? defaultNextAction(journeyInputs)
              : "Loading your next move…"}
          </p>
          <div className="mt-5">
            <DuButton href={cont.href} variant="primary">
              {ready ? cont.label : "Continue"} →
            </DuButton>
          </div>
        </DuCard>
      </div>

      {/* Cockpit: activity + mentor + feed-forward */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Recent activity */}
        <DuCard>
          <Eyebrow>Recent activity</Eyebrow>
          <h3 className="mt-1.5 text-lg font-black tracking-tight">
            On your campus
          </h3>
          {ready && activity.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {activity.map((ev, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-[7px] h-2 w-2 shrink-0 rotate-45 bg-[#F5D11E]"
                  />
                  <Link
                    href={ev.href}
                    className="text-sm leading-relaxed text-[#3A372F] hover:text-[#0B0B0C]"
                  >
                    {ev.label}
                    <span className="ml-1.5 text-xs text-[#A8A296]">
                      · {formatDate(ev.at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[#56524B]">
              Nothing yet. Set up your venture and your campus comes alive.
            </p>
          )}
        </DuCard>

        {/* Latest mentor */}
        <DuCard>
          <Eyebrow>Latest from your mentor</Eyebrow>
          {ready && lastMentor ? (
            <>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#3A372F]">
                {firstLine(lastMentor.content)}
              </p>
              {lastMentor.suggestedQuestion ? (
                <p className="mt-3 text-xs italic text-[#6B675D]">
                  Suggested: “{lastMentor.suggestedQuestion}”
                </p>
              ) : null}
              <div className="mt-4">
                <DuButton href="/mentor" variant="outline">
                  Resume conversation
                </DuButton>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-[#56524B]">
                Your 24/7 AI Mentor knows your venture and remembers your
                conversation. Ask it anything.
              </p>
              <div className="mt-4">
                <DuButton href="/mentor" variant="outline">
                  Open AI Mentor
                </DuButton>
              </div>
            </>
          )}
        </DuCard>

        {/* Latest feed-forward */}
        <DuCard>
          <Eyebrow>Latest feed-forward</Eyebrow>
          {ready && feedforward ? (
            <>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#3A372F]">
                {feedforward.summary}
              </p>
              <div className="mt-4">
                <DuButton href="/module/effectuation/feedback" variant="outline">
                  Open Review Room
                </DuButton>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-[#56524B]">
              No feed-forward yet. Build your roadmap and generate your first
              report — direct, founder-to-founder, never a grade.
            </p>
          )}
        </DuCard>
      </div>

      {/* Venture card */}
      <div className="mt-8">
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
              {feedforward && feedforward.strengths.length > 0 ? (
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B675D]">
                    Strengths so far
                  </p>
                  <div className="mt-2">
                    <DuTickList items={feedforward.strengths.slice(0, 2)} />
                  </div>
                </div>
              ) : null}
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
                what you&apos;re building — or drop in a demo venture to see the
                whole journey instantly.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <DuButton href="/module/effectuation/studio" variant="primary">
                  Create venture profile
                </DuButton>
                <DuButton variant="accent" onClick={handleUseDemo}>
                  Use demo venture
                </DuButton>
              </div>
            </>
          )}
        </DuCard>
      </div>
    </DuShell>
  );
}

function defaultNextAction(inputs: JourneyInputs): string {
  if (!inputs.hasProfile) {
    return "Create your venture profile so the campus can reason about what you're actually building.";
  }
  if (inputs.reflectionsCount === 0) {
    return "Work through the Effectuation concepts and apply each one to your venture.";
  }
  if (!inputs.hasFeedforward) {
    return "Build your Effectuation Roadmap and generate feed-forward before mentor review.";
  }
  return "Revise from your feed-forward, then reflect and prepare for mentor review.";
}

function buildActivity(input: {
  profileCreatedAt?: string;
  ventureName?: string;
  feedforwardAt?: string;
  revisionCount: number;
  lastMentorAt?: string;
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  if (input.profileCreatedAt) {
    events.push({
      at: input.profileCreatedAt,
      label: `Created venture ${input.ventureName ?? ""}`.trim(),
      href: "/module/effectuation/studio",
    });
  }
  if (input.feedforwardAt) {
    events.push({
      at: input.feedforwardAt,
      label:
        input.revisionCount > 1
          ? `Generated feed-forward · Draft ${input.revisionCount}`
          : "Generated your first feed-forward",
      href: "/module/effectuation/feedback",
    });
  }
  if (input.lastMentorAt) {
    events.push({
      at: input.lastMentorAt,
      label: "Talked with your AI Mentor",
      href: "/mentor",
    });
  }
  return events.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 5);
}

function firstLine(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}…` : trimmed;
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
