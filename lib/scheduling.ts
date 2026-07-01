import type { MistakeSchedule, ReviewRating } from "./types";
import { addDaysToDate, getTodayIsoDate } from "./utils";

/**
 * In-house spaced-repetition scheduler based on the FSRS-5 algorithm
 * (Free Spaced Repetition Scheduler). No external dependency.
 *
 * Each mistake carries a memory state — `stability` (days until recall drops to
 * the desired retention) and `difficulty` (1–10). Every review supplies a
 * rating (again/hard/good/easy) that updates the state and computes the next
 * due date. A mistake is never "done": it resurfaces right before it would be
 * forgotten, then the interval grows as recall succeeds.
 *
 * All functions are pure. Dates are local YYYY-MM-DD strings, matching the
 * rest of the app (see lib/utils).
 */

// FSRS-5 default parameters (19 weights).
const W = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575,
  0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655,
  0.6621,
] as const;

const DECAY = -0.5;
// FACTOR = 0.9^(1/DECAY) - 1, the constant that makes R = 0.9 at t = stability.
const FACTOR = 19 / 81;
const DESIRED_RETENTION = 0.9;

const MIN_STABILITY = 0.01;
const MAX_STABILITY = 36500; // ~100 years
const MAX_INTERVAL_DAYS = 365;

const GRADE: Record<ReviewRating, 1 | 2 | 3 | 4> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

function clampDifficulty(difficulty: number): number {
  if (!Number.isFinite(difficulty)) return 5;
  return Math.min(10, Math.max(1, difficulty));
}

function clampStability(stability: number): number {
  if (!Number.isFinite(stability)) return MIN_STABILITY;
  return Math.min(MAX_STABILITY, Math.max(MIN_STABILITY, stability));
}

function initialStability(grade: number): number {
  return clampStability(W[grade - 1]);
}

function initialDifficulty(grade: number): number {
  return clampDifficulty(W[4] - Math.exp(W[5] * (grade - 1)) + 1);
}

/** Recall probability after `elapsedDays` given `stability`. */
function retrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + FACTOR * (Math.max(0, elapsedDays) / stability), DECAY);
}

/** Days until recall drops to the desired retention. */
function nextInterval(stability: number): number {
  const raw =
    (stability / FACTOR) *
    (Math.pow(DESIRED_RETENTION, 1 / DECAY) - 1);
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(raw)));
}

function nextDifficulty(difficulty: number, grade: number): number {
  const delta = -W[6] * (grade - 3);
  // Linear damping — difficulty moves less as it approaches the ceiling.
  const damped = difficulty + delta * ((10 - difficulty) / 9);
  // Mean reversion toward the "easy" baseline keeps difficulty from drifting.
  const reverted = W[7] * initialDifficulty(4) + (1 - W[7]) * damped;
  return clampDifficulty(reverted);
}

function stabilityAfterRecall(
  difficulty: number,
  stability: number,
  retrieval: number,
  grade: number
): number {
  const hardPenalty = grade === 2 ? W[15] : 1;
  const easyBonus = grade === 4 ? W[16] : 1;
  const growth =
    Math.exp(W[8]) *
    (11 - difficulty) *
    Math.pow(stability, -W[9]) *
    (Math.exp(W[10] * (1 - retrieval)) - 1) *
    hardPenalty *
    easyBonus;
  return clampStability(stability * (1 + growth));
}

function stabilityAfterForget(
  difficulty: number,
  stability: number,
  retrieval: number
): number {
  const forgotten =
    W[11] *
    Math.pow(difficulty, -W[12]) *
    (Math.pow(stability + 1, W[13]) - 1) *
    Math.exp(W[14] * (1 - retrieval));
  // Post-lapse stability should not exceed the pre-lapse value.
  return clampStability(Math.min(forgotten, stability));
}

/** Same-day re-review (short-term memory) uses a lighter update. */
function stabilityShortTerm(stability: number, grade: number): number {
  return clampStability(stability * Math.exp(W[17] * (grade - 3 + W[18])));
}

function isoDateOnly(value: string): string {
  return value.slice(0, 10);
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function daysBetweenIso(from: string, to: string): number {
  const fromMs = new Date(`${isoDateOnly(from)}T00:00:00`).getTime();
  const toMs = new Date(`${isoDateOnly(to)}T00:00:00`).getTime();
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return 0;
  return Math.max(0, Math.round((toMs - fromMs) / 86_400_000));
}

/** A brand-new mistake: due immediately, no memory state yet. */
export function newSchedule(today: string = getTodayIsoDate()): MistakeSchedule {
  return {
    stability: 0,
    difficulty: 0,
    due: today,
    lastReview: null,
    state: "new",
    reps: 0,
    lapses: 0,
  };
}

/** Advance a mistake's memory state after a graded review. */
export function gradeSchedule(
  schedule: MistakeSchedule,
  rating: ReviewRating,
  today: string = getTodayIsoDate()
): MistakeSchedule {
  const grade = GRADE[rating];
  const lapsed = grade === 1;
  const state: MistakeSchedule["state"] = lapsed ? "relearning" : "review";

  // First graded review of a new card seeds stability and difficulty.
  if (schedule.state === "new" || schedule.lastReview === null) {
    const stability = initialStability(grade);
    return {
      stability,
      difficulty: initialDifficulty(grade),
      due: addDaysToDate(today, nextInterval(stability)),
      lastReview: today,
      state,
      reps: schedule.reps + 1,
      lapses: schedule.lapses + (lapsed ? 1 : 0),
    };
  }

  const elapsed = daysBetweenIso(schedule.lastReview, today);
  const retrieval = retrievability(elapsed, schedule.stability);
  const difficulty = nextDifficulty(schedule.difficulty, grade);

  let stability: number;
  if (elapsed < 1) {
    stability = stabilityShortTerm(schedule.stability, grade);
  } else if (lapsed) {
    stability = stabilityAfterForget(
      schedule.difficulty,
      schedule.stability,
      retrieval
    );
  } else {
    stability = stabilityAfterRecall(
      schedule.difficulty,
      schedule.stability,
      retrieval,
      grade
    );
  }

  return {
    stability,
    difficulty,
    due: addDaysToDate(today, nextInterval(stability)),
    lastReview: today,
    state,
    reps: schedule.reps + 1,
    lapses: schedule.lapses + (lapsed ? 1 : 0),
  };
}

export function isValidSchedule(value: unknown): value is MistakeSchedule {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const schedule = value as Partial<MistakeSchedule>;
  const validState =
    schedule.state === "new" ||
    schedule.state === "learning" ||
    schedule.state === "review" ||
    schedule.state === "relearning";
  const validLastReview =
    schedule.lastReview === null ||
    (typeof schedule.lastReview === "string" &&
      isValidIsoDate(isoDateOnly(schedule.lastReview)));

  return (
    typeof schedule.due === "string" &&
    isValidIsoDate(isoDateOnly(schedule.due)) &&
    typeof schedule.stability === "number" &&
    Number.isFinite(schedule.stability) &&
    schedule.stability >= 0 &&
    typeof schedule.difficulty === "number" &&
    Number.isFinite(schedule.difficulty) &&
    schedule.difficulty >= 0 &&
    schedule.difficulty <= 10 &&
    validLastReview &&
    validState &&
    typeof schedule.reps === "number" &&
    Number.isFinite(schedule.reps) &&
    schedule.reps >= 0 &&
    typeof schedule.lapses === "number" &&
    Number.isFinite(schedule.lapses) &&
    schedule.lapses >= 0
  );
}

/** True when a mistake should appear in the review queue today. */
export function isScheduleDue(
  schedule: MistakeSchedule | undefined,
  today: string = getTodayIsoDate()
): boolean {
  if (!isValidSchedule(schedule)) return true;
  if (schedule.state === "new") return true;
  return isoDateOnly(schedule.due) <= today;
}
