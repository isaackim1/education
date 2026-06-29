/**
 * Unknown Digital University — Founder Journey Brain (Phase DU-1A).
 *
 * Pure derivation logic for the founder's progress through a module. No storage
 * or window access here — callers pass in the data they already loaded — so this
 * is safe on both server and client and is trivial to unit-test later.
 */

import type {
  AssignmentSubmission,
  FeedForwardResult,
  FounderState,
  ProgressState,
} from "./types";

export const PROGRAM_ID = "entrepreneurship-foundations";
export const EFFECTUATION_MODULE_ID = "effectuation";

// Ordered states, used to render the journey as a stepper.
export const PROGRESS_ORDER: ProgressState[] = [
  "not_started",
  "learning_concept",
  "applying_to_venture",
  "draft_submitted",
  "feedforward_received",
  "revision_needed",
  "reflection_complete",
  "ready_for_mentor_review",
  "module_complete",
];

const PROGRESS_LABELS: Record<ProgressState, string> = {
  not_started: "Not started",
  learning_concept: "Learning the concepts",
  applying_to_venture: "Applying to your venture",
  draft_submitted: "Draft submitted",
  feedforward_received: "Feed-forward received",
  revision_needed: "Revision in progress",
  reflection_complete: "Reflection complete",
  ready_for_mentor_review: "Ready for mentor review",
  module_complete: "Module complete",
};

export function progressStateLabel(state: ProgressState): string {
  return PROGRESS_LABELS[state];
}

export function createInitialFounderState(
  founderProfileId: string,
  moduleId: string = EFFECTUATION_MODULE_ID,
): FounderState {
  return {
    founderProfileId,
    currentModuleId: moduleId,
    currentStepId: "welcome",
    progressState: "not_started",
    strengths: [],
    risks: [],
    recurringPatterns: [],
    nextRecommendedAction: undefined,
  };
}

// ── Submission completeness ──────────────────────────────────────────────────
export interface SubmissionCompleteness {
  filled: number;
  total: number;
  ratio: number;
  /** A strong, demo-ready submission: most sections filled with real substance. */
  isStrong: boolean;
}

const MIN_SUBSTANCE_CHARS = 40;

export function deriveSubmissionCompleteness(
  submission: AssignmentSubmission | null,
  sectionIds: string[],
): SubmissionCompleteness {
  const total = sectionIds.length;
  if (!submission || total === 0) {
    return { filled: 0, total, ratio: 0, isStrong: false };
  }
  let filled = 0;
  let substantial = 0;
  for (const id of sectionIds) {
    const value = (submission.sections[id] ?? "").trim();
    if (value.length > 0) filled += 1;
    if (value.length >= MIN_SUBSTANCE_CHARS) substantial += 1;
  }
  const ratio = total === 0 ? 0 : filled / total;
  const isStrong = filled === total && substantial >= Math.ceil(total * 0.75);
  return { filled, total, ratio, isStrong };
}

// ── Apply feed-forward to the journey ────────────────────────────────────────
/**
 * After feed-forward is generated, advance the founder's journey. A clean,
 * substantial submission lands on `feedforward_received`; a thin one signals
 * `revision_needed`. We never auto-claim completion — reflection is a
 * deliberate, founder-driven step.
 */
export function applyFeedForwardToState(
  prev: FounderState,
  report: FeedForwardResult,
  completeness: SubmissionCompleteness,
): FounderState {
  const needsRevision =
    !completeness.isStrong ||
    report.unsupportedAssumptions.length > 0 ||
    report.unclearAreas.length > 1;

  const progressState: ProgressState = needsRevision
    ? "revision_needed"
    : "feedforward_received";

  return {
    ...prev,
    progressState,
    currentStepId: "feed-forward",
    strengths: dedupe(report.strengths).slice(0, 6),
    risks: dedupe([
      ...report.unsupportedAssumptions,
      ...report.unclearAreas,
    ]).slice(0, 6),
    recurringPatterns: deriveRecurringPatterns(prev, report),
    nextRecommendedAction: report.nextAction || prev.nextRecommendedAction,
  };
}

export function markReflectionComplete(prev: FounderState): FounderState {
  return {
    ...prev,
    progressState: "reflection_complete",
    currentStepId: "reflect",
  };
}

export function markReadyForMentorReview(prev: FounderState): FounderState {
  return {
    ...prev,
    progressState: "ready_for_mentor_review",
    currentStepId: "mentor-review",
  };
}

/**
 * "Approaching mentor review readiness" — a soft signal, shown only when the
 * work is genuinely strong. It does NOT claim completion; the founder still has
 * to reflect first.
 */
export function isApproachingMentorReview(
  state: FounderState,
  completeness: SubmissionCompleteness,
): boolean {
  return (
    completeness.isStrong &&
    (state.progressState === "feedforward_received" ||
      state.progressState === "reflection_complete")
  );
}

export function isReadyForMentorReview(state: FounderState): boolean {
  return (
    state.progressState === "ready_for_mentor_review" ||
    state.progressState === "module_complete"
  );
}

// ── Module progress percent (for the Progress Journey + cards) ───────────────
export interface ModuleProgressInputs {
  reflectionsCompleted: number;
  totalConcepts: number;
  completeness: SubmissionCompleteness;
  state: FounderState | null;
}

/**
 * A blended progress signal across the three phases of a module: learning
 * (reflections), building (assignment completeness), and review (journey state).
 * Deliberately weighted so the demo path visibly fills as the founder moves.
 */
export function moduleProgressPercent(inputs: ModuleProgressInputs): number {
  const { reflectionsCompleted, totalConcepts, completeness, state } = inputs;

  const learnWeight = 0.4;
  const buildWeight = 0.4;
  const reviewWeight = 0.2;

  const learn =
    totalConcepts === 0 ? 0 : Math.min(1, reflectionsCompleted / totalConcepts);
  const build = completeness.ratio;
  const review = state ? reviewProgressFraction(state.progressState) : 0;

  const pct =
    (learn * learnWeight + build * buildWeight + review * reviewWeight) * 100;
  return Math.round(pct);
}

function reviewProgressFraction(state: ProgressState): number {
  switch (state) {
    case "not_started":
    case "learning_concept":
    case "applying_to_venture":
      return 0;
    case "draft_submitted":
      return 0.3;
    case "revision_needed":
      return 0.4;
    case "feedforward_received":
      return 0.6;
    case "reflection_complete":
      return 0.8;
    case "ready_for_mentor_review":
      return 0.95;
    case "module_complete":
      return 1;
    default:
      return 0;
  }
}

// ── Journey milestones (Phase 2: clearer founder journey) ────────────────────
export interface JourneyInputs {
  hasProfile: boolean;
  reflectionsCount: number;
  totalConcepts: number;
  submissionFilled: number;
  hasFeedforward: boolean;
  revisionsCount: number;
  reflectionComplete: boolean;
  state: FounderState | null;
}

export interface Milestone {
  id: string;
  label: string;
  complete: boolean;
  /** The first not-yet-complete milestone — the founder's live focus. */
  current: boolean;
  hint: string;
  href: string;
}

/**
 * The seven-step founder journey, inferred entirely from localStorage-derived
 * inputs. Order matters: the first incomplete milestone is the "current" one and
 * doubles as the founder's bottleneck.
 */
export function deriveMilestones(inputs: JourneyInputs): Milestone[] {
  const conceptsExplored =
    inputs.totalConcepts > 0 &&
    inputs.reflectionsCount >= Math.ceil(inputs.totalConcepts / 2);
  const revisionInProgress =
    inputs.revisionsCount >= 2 ||
    inputs.state?.progressState === "revision_needed";

  const raw: Omit<Milestone, "current">[] = [
    {
      id: "profile",
      label: "Venture profile created",
      complete: inputs.hasProfile,
      hint: "Set up who you are and what you're building.",
      href: "/module/effectuation/studio",
    },
    {
      id: "concepts",
      label: "Core concepts explored",
      complete: conceptsExplored,
      hint: "Apply the effectuation concepts to your venture.",
      href: "/module/effectuation/learn",
    },
    {
      id: "draft",
      label: "Roadmap draft started",
      complete: inputs.submissionFilled > 0,
      hint: "Start building your Effectuation Roadmap in the Studio.",
      href: "/module/effectuation/studio",
    },
    {
      id: "feedforward",
      label: "Feed-forward received",
      complete: inputs.hasFeedforward,
      hint: "Generate feed-forward on your roadmap.",
      href: "/module/effectuation/studio",
    },
    {
      id: "revision",
      label: "Revision in progress",
      complete: revisionInProgress,
      hint: "Revise your roadmap from the feed-forward.",
      href: "/module/effectuation/studio",
    },
    {
      id: "reflection",
      label: "Reflection completed",
      complete: inputs.reflectionComplete,
      hint: "Reflect on what you'll change before review.",
      href: "/module/effectuation/feedback",
    },
    {
      id: "review",
      label: "Ready for mentor review",
      complete: inputs.state
        ? isReadyForMentorReview(inputs.state)
        : false,
      hint: "Mark yourself ready and prep with the AI Mentor.",
      href: "/progress",
    },
  ];

  const firstIncomplete = raw.findIndex((m) => !m.complete);
  return raw.map((m, i) => ({ ...m, current: i === firstIncomplete }));
}

/** The current bottleneck = the first incomplete milestone. */
export function deriveBottleneck(
  milestones: Milestone[],
): { label: string; hint: string; href: string } | null {
  const current = milestones.find((m) => m.current);
  if (!current) return null;
  return { label: current.label, hint: current.hint, href: current.href };
}

// ── Review-readiness language (never "passed"/"graded") ──────────────────────
export type ReviewStatus = "building" | "revision" | "approaching" | "ready";

export function deriveReviewStatus(
  state: FounderState | null,
  completeness: SubmissionCompleteness,
): { status: ReviewStatus; label: string; detail: string } {
  if (state && isReadyForMentorReview(state)) {
    return {
      status: "ready",
      label: "Ready to discuss with a mentor",
      detail: "You've learned, built, and reflected. Bring this to a human mentor.",
    };
  }
  if (state?.progressState === "revision_needed") {
    return {
      status: "revision",
      label: "Needs another revision",
      detail: "Tighten the open assumptions and unclear areas, then regenerate feed-forward.",
    };
  }
  if (state && isApproachingMentorReview(state, completeness)) {
    return {
      status: "approaching",
      label: "Approaching mentor review readiness",
      detail: "Strong work. Finish reflecting, then mark yourself ready for review.",
    };
  }
  return {
    status: "building",
    label: "Still building toward review",
    detail: "Keep applying concepts and building your roadmap — feed-forward will guide you.",
  };
}

/**
 * "Continue where you left off" routing, following the founder down the funnel.
 */
export function resolveContinueRoute(inputs: JourneyInputs): {
  href: string;
  label: string;
} {
  if (!inputs.hasProfile) {
    return { href: "/module/effectuation/studio", label: "Set up your venture" };
  }
  if (inputs.reflectionsCount === 0) {
    return { href: "/module/effectuation/learn", label: "Explore the concepts" };
  }
  if (inputs.submissionFilled === 0) {
    return { href: "/module/effectuation/studio", label: "Build your roadmap" };
  }
  if (!inputs.hasFeedforward) {
    return {
      href: "/module/effectuation/studio",
      label: "Generate feed-forward",
    };
  }
  if (inputs.reflectionComplete) {
    return { href: "/progress", label: "Review your progress journey" };
  }
  return {
    href: "/module/effectuation/feedback",
    label: "Read your feed-forward",
  };
}

/** Draft 1 / Draft 2 / Latest revision labelling for the history list. */
export function revisionLabel(index: number, total: number): string {
  if (index === total - 1) return "Latest revision";
  return `Draft ${index + 1}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const item = raw.trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function deriveRecurringPatterns(
  prev: FounderState,
  report: FeedForwardResult,
): string[] {
  // A pattern is recurring if a risk theme reappears across feed-forward passes.
  const previous = new Set(prev.risks.map((r) => r.toLowerCase()));
  const recurring = report.unsupportedAssumptions
    .concat(report.unclearAreas)
    .filter((item) => previous.has(item.trim().toLowerCase()));
  return dedupe([...prev.recurringPatterns, ...recurring]).slice(0, 5);
}
