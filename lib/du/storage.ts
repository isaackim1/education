/**
 * Unknown Digital University — localStorage backing (Phase DU-1A).
 *
 * Mirrors the SSR-safe JSON helpers used elsewhere in Ivvy (lib/storage.ts):
 * every read is guarded by `isBrowser()` and returns a fallback during server
 * render, so DU client components can call these directly without crashing SSR.
 *
 * Keys are namespaced `du_*` so they never collide with the exam-coach
 * (`studycoach_*`) keys. This is the single seam a future database would
 * replace.
 */

import type {
  AssignmentSubmission,
  FeedForwardReport,
  FounderProfile,
  FounderState,
  LessonReflections,
} from "./types";

export const DU_KEYS = {
  founderProfile: "du_founder_profile",
  submission: "du_effectuation_submission",
  latestFeedforward: "du_latest_feedforward",
  founderState: "du_founder_state",
  lessonReflections: "du_lesson_reflections",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeItem(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function duGenerateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `du_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

// ── Founder profile ──────────────────────────────────────────────────────────
export function getFounderProfile(): FounderProfile | null {
  return readJson<FounderProfile | null>(DU_KEYS.founderProfile, null);
}

export function saveFounderProfile(profile: FounderProfile): boolean {
  return writeJson(DU_KEYS.founderProfile, profile);
}

// ── Assignment submission ────────────────────────────────────────────────────
export function getSubmission(): AssignmentSubmission | null {
  return readJson<AssignmentSubmission | null>(DU_KEYS.submission, null);
}

export function saveSubmission(submission: AssignmentSubmission): boolean {
  return writeJson(DU_KEYS.submission, submission);
}

// ── Feed-forward report ──────────────────────────────────────────────────────
export function getLatestFeedForward(): FeedForwardReport | null {
  return readJson<FeedForwardReport | null>(DU_KEYS.latestFeedforward, null);
}

export function saveLatestFeedForward(report: FeedForwardReport): boolean {
  return writeJson(DU_KEYS.latestFeedforward, report);
}

// ── Founder journey state ────────────────────────────────────────────────────
export function getFounderState(): FounderState | null {
  return readJson<FounderState | null>(DU_KEYS.founderState, null);
}

export function saveFounderState(state: FounderState): boolean {
  return writeJson(DU_KEYS.founderState, state);
}

// ── Lesson reflections ───────────────────────────────────────────────────────
export function getLessonReflections(): LessonReflections {
  return readJson<LessonReflections>(DU_KEYS.lessonReflections, {});
}

export function saveLessonReflection(conceptId: string, text: string): boolean {
  const all = getLessonReflections();
  all[conceptId] = text;
  return writeJson(DU_KEYS.lessonReflections, all);
}

// ── Reset (useful for demos) ─────────────────────────────────────────────────
export function clearAllDuData(): void {
  Object.values(DU_KEYS).forEach((key) => removeItem(key));
}
