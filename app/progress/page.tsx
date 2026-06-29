"use client";

import { useFounder } from "@/hooks/useFounder";
import {
  DuButton,
  DuCard,
  DuProgressBar,
  DuShell,
  DuStat,
  Eyebrow,
  SectionTitle,
} from "@/components/du/ui";
import {
  EFFECTUATION_MODULE,
  EFFECTUATION_SECTION_IDS,
} from "@/data/unknown/effectuation";
import {
  PROGRESS_ORDER,
  deriveSubmissionCompleteness,
  isApproachingMentorReview,
  isReadyForMentorReview,
  markReadyForMentorReview,
  moduleProgressPercent,
  progressStateLabel,
} from "@/lib/du/progress";
import {
  getFounderState,
  saveFounderState,
} from "@/lib/du/storage";

export default function ProgressPage() {
  const { ready, profile, submission, feedforward, state, reflections, refresh } =
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

  const approaching = state
    ? isApproachingMentorReview(state, completeness)
    : false;
  const reviewReady = state ? isReadyForMentorReview(state) : false;
  const currentLabel = state
    ? progressStateLabel(state.progressState)
    : "Not started";

  const reflectionComplete =
    state?.progressState === "reflection_complete" ||
    state?.progressState === "ready_for_mentor_review" ||
    state?.progressState === "module_complete";

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
        <div className="grid gap-6 sm:grid-cols-3">
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
              <Eyebrow>Ready for mentor review</Eyebrow>
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

      {/* Journey stepper */}
      <DuCard className="mb-6">
        <Eyebrow>The journey</Eyebrow>
        <h3 className="mt-1.5 mb-4 text-lg font-black tracking-tight">
          Where you are
        </h3>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRESS_ORDER.filter((s) => s !== "revision_needed").map((s) => {
            const isCurrent = ready && state?.progressState === s;
            const reached =
              ready &&
              state &&
              PROGRESS_ORDER.indexOf(state.progressState) >=
                PROGRESS_ORDER.indexOf(s);
            return (
              <li
                key={s}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${
                  isCurrent
                    ? "border-[#0B0B0C] bg-[#0B0B0C] text-white"
                    : reached
                      ? "border-[#0B0B0C] bg-white"
                      : "border-[#E2DCCD] bg-white text-[#A8A296]"
                }`}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rotate-45"
                  style={{
                    background: reached || isCurrent ? "#F5D11E" : "#D8D2C2",
                  }}
                />
                <span className="text-xs font-bold uppercase tracking-[0.08em]">
                  {progressStateLabel(s)}
                </span>
              </li>
            );
          })}
        </ol>
      </DuCard>

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

      {/* Latest feed-forward + next action */}
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
                  View full report
                </DuButton>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-[#56524B]">
              No feed-forward yet — build your roadmap in the Studio.
            </p>
          )}
        </DuCard>

        <DuCard tone="yellow">
          <Eyebrow>Next recommended action</Eyebrow>
          <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[#0B0B0C]">
            {ready && state?.nextRecommendedAction
              ? state.nextRecommendedAction
              : "Work through the Effectuation concepts and build your roadmap to unlock your next action."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
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
    </DuShell>
  );
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
