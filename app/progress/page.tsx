"use client";

import { useFounder } from "@/hooks/useFounder";
import {
  DuButton,
  DuCard,
  DuProgressBar,
  DuShell,
  DuStat,
  DuTag,
  Eyebrow,
  SectionTitle,
} from "@/components/du/ui";
import {
  EFFECTUATION_MODULE,
  EFFECTUATION_SECTION_IDS,
} from "@/data/unknown/effectuation";
import {
  deriveBottleneck,
  deriveMilestones,
  deriveReviewStatus,
  deriveSubmissionCompleteness,
  isApproachingMentorReview,
  isReadyForMentorReview,
  markReadyForMentorReview,
  moduleProgressPercent,
  progressStateLabel,
  type JourneyInputs,
} from "@/lib/du/progress";
import { getFounderState, saveFounderState } from "@/lib/du/storage";

export default function ProgressPage() {
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
  const milestones = deriveMilestones(journeyInputs);
  const bottleneck = deriveBottleneck(milestones);
  const review = deriveReviewStatus(state, completeness);

  const approaching = state
    ? isApproachingMentorReview(state, completeness)
    : false;
  const reviewReady = state ? isReadyForMentorReview(state) : false;
  const currentLabel = state
    ? progressStateLabel(state.progressState)
    : "Not started";

  const latestMentorQuestion =
    [...mentorThread].reverse().find((m) => m.role === "mentor" && m.suggestedQuestion)
      ?.suggestedQuestion ?? feedforward?.mentorQuestions?.[0];
  const latestNextAction =
    state?.nextRecommendedAction ?? feedforward?.nextAction;

  function handleMarkReady() {
    const prev = getFounderState();
    if (!prev) return;
    saveFounderState(markReadyForMentorReview(prev));
    refresh();
  }

  return (
    <DuShell>
      <SectionTitle
        eyebrow="Founder Progress Journey"
        title={profile ? `${profile.ventureName} — your journey` : "Your journey"}
        description="Not grades. A live read on what you've built, what's still risky, and whether you're ready for mentor review."
      />

      {/* Top metrics */}
      <DuCard tone="ink" className="mb-6">
        <div className="grid gap-6 sm:grid-cols-4">
          <DuStat
            onDark
            label="Module progress"
            value={ready ? `${percent}%` : "—"}
            detail="Effectuation Roadmap"
          />
          <DuStat
            onDark
            label="Current state"
            value={
              <span className="text-xl font-black leading-tight">
                {ready ? currentLabel : "—"}
              </span>
            }
          />
          <DuStat
            onDark
            label="Revisions"
            value={ready ? revisions.length : "—"}
            detail={
              ready && feedforward
                ? `Last feed-forward ${formatDate(feedforward.createdAt)}`
                : "No feed-forward yet"
            }
          />
          <DuStat
            onDark
            label="Mentor review"
            value={
              <span className="text-xl font-black leading-tight">
                {reviewReady ? "Ready" : approaching ? "Approaching" : "Not yet"}
              </span>
            }
          />
        </div>
        <div className="mt-5">
          <DuProgressBar percent={ready ? percent : 0} onDark />
        </div>
      </DuCard>

      {/* Readiness banner */}
      {ready && reviewReady ? (
        <DuCard tone="yellow" className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Eyebrow>Ready to discuss with a mentor</Eyebrow>
              <p className="mt-1 text-[15px] font-bold text-[#0B0B0C]">
                You&apos;ve learned, built, and reflected. Bring your roadmap to
                your mentor.
              </p>
            </div>
            <DuButton href="/mentor" variant="primary">
              Prep with AI Mentor →
            </DuButton>
          </div>
        </DuCard>
      ) : ready && approaching ? (
        <DuCard className="mb-6 border-2 border-[#F5D11E]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Eyebrow>Approaching mentor review readiness</Eyebrow>
              <p className="mt-1 text-[15px] font-semibold text-[#3A372F]">
                {reflectionComplete
                  ? "Your work is strong and your reflection is done — mark yourself ready for mentor review."
                  : "Your roadmap is strong. Finish your reflection on the feed-forward page to complete the module's final step."}
              </p>
            </div>
            {reflectionComplete ? (
              <DuButton variant="primary" onClick={handleMarkReady}>
                Mark ready for review
              </DuButton>
            ) : (
              <DuButton href="/module/effectuation/feedback" variant="primary">
                Go reflect →
              </DuButton>
            )}
          </div>
        </DuCard>
      ) : null}

      {/* Milestone timeline */}
      <DuCard className="mb-6">
        <Eyebrow>Founder journey</Eyebrow>
        <h3 className="mt-1.5 mb-5 text-lg font-black tracking-tight">
          Seven milestones to mentor review
        </h3>
        <ol className="relative space-y-1">
          {milestones.map((m, i) => {
            const done = ready && m.complete;
            const current = ready && m.current;
            return (
              <li key={m.id} className="flex gap-4">
                {/* Rail */}
                <div className="flex flex-col items-center">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-black ${
                      done
                        ? "border-[#0B0B0C] bg-[#0B0B0C] text-[#F5D11E]"
                        : current
                          ? "border-[#F5D11E] bg-[#F5D11E] text-[#0B0B0C]"
                          : "border-[#D8D2C2] bg-white text-[#A8A296]"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {i < milestones.length - 1 ? (
                    <span
                      className={`my-1 w-0.5 flex-1 ${
                        done ? "bg-[#0B0B0C]" : "bg-[#E2DCCD]"
                      }`}
                      style={{ minHeight: 18 }}
                    />
                  ) : null}
                </div>
                {/* Label */}
                <div className={`pb-4 ${i === milestones.length - 1 ? "pb-0" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-black tracking-tight ${
                        done || current ? "text-[#0B0B0C]" : "text-[#A8A296]"
                      }`}
                    >
                      {m.label}
                    </span>
                    {current ? <DuTag tone="accent">You&apos;re here</DuTag> : null}
                  </div>
                  {current ? (
                    <p className="mt-1 text-sm text-[#56524B]">{m.hint}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </DuCard>

      {/* At-a-glance signals */}
      <div className="mb-6 grid gap-5 lg:grid-cols-3">
        <DuCard className="border-2 border-[#0B0B0C]">
          <Eyebrow>Current bottleneck</Eyebrow>
          {ready && bottleneck ? (
            <>
              <h3 className="mt-1.5 text-lg font-black tracking-tight">
                {bottleneck.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
                {bottleneck.hint}
              </p>
              <div className="mt-4">
                <DuButton href={bottleneck.href} variant="primary">
                  Resolve it →
                </DuButton>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-[#56524B]">
              Nothing blocking you — you&apos;ve reached the end of the journey.
            </p>
          )}
        </DuCard>

        <DuCard>
          <Eyebrow>Latest mentor question</Eyebrow>
          {ready && latestMentorQuestion ? (
            <p className="mt-3 text-sm leading-relaxed text-[#3A372F]">
              “{latestMentorQuestion}”
            </p>
          ) : (
            <p className="mt-3 text-sm text-[#8A8579]">
              Talk to the AI Mentor or generate feed-forward to surface a question.
            </p>
          )}
          <div className="mt-4">
            <DuButton href="/mentor" variant="outline">
              Open mentor
            </DuButton>
          </div>
        </DuCard>

        <DuCard tone="yellow">
          <Eyebrow>Latest next action</Eyebrow>
          <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[#0B0B0C]">
            {ready && latestNextAction
              ? latestNextAction
              : "Work through the Effectuation concepts and build your roadmap to unlock your next action."}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B0B0C]/60">
            {review.label}
          </p>
        </DuCard>
      </div>

      {/* Strengths / risks / patterns */}
      <div className="grid gap-5 lg:grid-cols-3">
        <SignalCard
          eyebrow="Strengths"
          title="What's working"
          items={state?.strengths ?? []}
          marker="#137333"
          empty="Generate feed-forward to surface your strengths."
        />
        <SignalCard
          eyebrow="Risks"
          title="What to de-risk"
          items={state?.risks ?? []}
          marker="#B42318"
          empty="No open risks flagged yet."
        />
        <SignalCard
          eyebrow="Recurring patterns"
          title="Keeps coming up"
          items={state?.recurringPatterns ?? []}
          marker="#9A6700"
          empty="Patterns appear after a few feed-forward passes."
        />
      </div>

      {/* Latest feed-forward + actions */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <DuCard>
          <Eyebrow>Latest feed-forward</Eyebrow>
          <h3 className="mt-1.5 text-lg font-black tracking-tight">Summary</h3>
          {ready && feedforward ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-[#3A372F]">
                {feedforward.summary}
              </p>
              <div className="mt-4">
                <DuButton href="/module/effectuation/feedback" variant="outline">
                  Open Review Room
                </DuButton>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-[#56524B]">
              No feed-forward yet — build your roadmap in the Studio.
            </p>
          )}
        </DuCard>

        <DuCard>
          <Eyebrow>Keep moving</Eyebrow>
          <h3 className="mt-1.5 text-lg font-black tracking-tight">
            Your next moves
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <DuButton href="/module/effectuation/studio" variant="primary">
              Open Studio
            </DuButton>
            <DuButton href="/module/effectuation/learn" variant="outline">
              Continue learning
            </DuButton>
          </div>
        </DuCard>
      </div>

      {ready && !state ? (
        <div className="mt-6">
          <DuCard className="border-2 border-dashed border-[#D8D2C2]">
            <div className="flex flex-col gap-3 text-center">
              <p className="text-sm font-semibold text-[#3A372F]">
                Your journey hasn&apos;t started yet. Begin the module to bring
                this dashboard to life.
              </p>
              <div className="flex justify-center">
                <DuButton href="/module/effectuation" variant="primary">
                  Start the module
                </DuButton>
              </div>
            </div>
          </DuCard>
        </div>
      ) : null}

      {/* Human mentors stay central */}
      <p className="mt-8 text-center text-xs leading-relaxed text-[#8A8579]">
        This journey and its AI feed-forward help you improve before mentor
        review. They don&apos;t grade, score, or replace human mentors, final
        assessment, or expert judgment.
      </p>
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

function SignalCard({
  eyebrow,
  title,
  items,
  marker,
  empty,
}: {
  eyebrow: string;
  title: string;
  items: string[];
  marker: string;
  empty: string;
}) {
  return (
    <DuCard>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="mt-1.5 text-lg font-black tracking-tight">{title}</h3>
      {items.length > 0 ? (
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
      ) : (
        <p className="mt-3 text-sm text-[#8A8579]">{empty}</p>
      )}
    </DuCard>
  );
}
