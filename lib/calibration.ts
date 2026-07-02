import type { ConfidenceLevel, RetrievalAttempt } from "./types";

/**
 * Calibration metrics — the gap between how sure a student felt and whether
 * they were actually right (the illusion-of-competence / Dunning-Kruger signal
 * from RESEARCH.md §5). Every function is pure and side-effect free.
 *
 * Confidence is captured as 1 (guessing) / 2 (fairly sure) / 3 (certain) and
 * normalized to 0 / 0.5 / 1 so it sits on the same 0–1 scale as correctness.
 * `wasCorrect` comes free from the FSRS grade — see RetrievalAttempt.
 */

/** Below this many attempts the calibration card stays in its instructional state. */
export const MIN_CALIBRATION_ATTEMPTS = 10;

/** A topic needs at least this many attempts before its breakdown is trustworthy. */
const MIN_TOPIC_ATTEMPTS = 3;

export interface TopicCalibration {
  topicId: string;
  attempts: number;
  /** meanConfidence − meanCorrectness for the topic. Positive ⇒ overconfident. */
  overconfidenceIndex: number;
}

export interface CalibrationMetrics {
  attemptCount: number;
  hasEnoughData: boolean;
  /** 0–100. 100 = perfectly calibrated (confidence tracked correctness exactly). */
  calibrationScore: number;
  /** meanConfidence − meanCorrectness across all attempts, −1…1. */
  overconfidenceIndex: number;
  meanConfidence: number;
  meanCorrectness: number;
  /** Attempts where the student was "certain". */
  feltSureCount: number;
  /** Of those, how many were actually wrong — the dangerous gap. */
  feltSureButWrongCount: number;
  topics: TopicCalibration[];
  /** Topic with the largest positive overconfidence index, if any qualifies. */
  mostOverconfidentTopicId: string | null;
}

function confidenceNorm(confidence: ConfidenceLevel): number {
  return (confidence - 1) / 2; // 1 → 0, 2 → 0.5, 3 → 1
}

function isValidConfidence(value: unknown): value is ConfidenceLevel {
  return value === 1 || value === 2 || value === 3;
}

/** Narrow persisted JSON back into a trustworthy attempt, or null if malformed. */
export function normalizeRetrievalAttempt(
  value: unknown
): RetrievalAttempt | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const attempt = value as Partial<RetrievalAttempt>;
  if (
    typeof attempt.mistakeId !== "string" ||
    attempt.mistakeId.length === 0 ||
    !isValidConfidence(attempt.predictedConfidence) ||
    typeof attempt.wasCorrect !== "boolean" ||
    typeof attempt.timestamp !== "string" ||
    Number.isNaN(new Date(attempt.timestamp).getTime())
  ) {
    return null;
  }
  return {
    mistakeId: attempt.mistakeId,
    topicId: typeof attempt.topicId === "string" ? attempt.topicId : null,
    predictedConfidence: attempt.predictedConfidence,
    wasCorrect: attempt.wasCorrect,
    timestamp: attempt.timestamp,
  };
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function topicOverconfidence(attempts: RetrievalAttempt[]): TopicCalibration[] {
  const byTopic = new Map<string, RetrievalAttempt[]>();
  for (const attempt of attempts) {
    if (!attempt.topicId || attempt.topicId === "general") continue;
    const bucket = byTopic.get(attempt.topicId) ?? [];
    bucket.push(attempt);
    byTopic.set(attempt.topicId, bucket);
  }

  const topics: TopicCalibration[] = [];
  byTopic.forEach((topicAttempts, topicId) => {
    if (topicAttempts.length < MIN_TOPIC_ATTEMPTS) return;
    const meanConfidence = mean(
      topicAttempts.map((a) => confidenceNorm(a.predictedConfidence))
    );
    const meanCorrectness = mean(
      topicAttempts.map((a) => (a.wasCorrect ? 1 : 0))
    );
    topics.push({
      topicId,
      attempts: topicAttempts.length,
      overconfidenceIndex: meanConfidence - meanCorrectness,
    });
  });

  return topics.sort((a, b) => b.overconfidenceIndex - a.overconfidenceIndex);
}

export function computeCalibration(
  attempts: RetrievalAttempt[]
): CalibrationMetrics {
  const attemptCount = attempts.length;
  const confidences = attempts.map((a) => confidenceNorm(a.predictedConfidence));
  const correctness = attempts.map((a) => (a.wasCorrect ? 1 : 0));

  const meanConfidence = mean(confidences);
  const meanCorrectness = mean(correctness);
  const meanGap = mean(
    attempts.map((a, i) => Math.abs(confidences[i] - correctness[i]))
  );

  const feltSure = attempts.filter((a) => a.predictedConfidence === 3);
  const topics = topicOverconfidence(attempts);
  const mostOverconfident = topics.find((t) => t.overconfidenceIndex > 0);

  return {
    attemptCount,
    hasEnoughData: attemptCount >= MIN_CALIBRATION_ATTEMPTS,
    calibrationScore: Math.round((1 - meanGap) * 100),
    overconfidenceIndex: meanConfidence - meanCorrectness,
    meanConfidence,
    meanCorrectness,
    feltSureCount: feltSure.length,
    feltSureButWrongCount: feltSure.filter((a) => !a.wasCorrect).length,
    topics,
    mostOverconfidentTopicId: mostOverconfident?.topicId ?? null,
  };
}

/**
 * Mistake ids whose most recent graded attempt was "certain" yet wrong — the
 * most dangerous gaps. The evidence loop resurfaces these first so the student's
 * own overconfidence drives what comes back into the next session.
 */
export function getOverconfidentMistakeIds(
  attempts: RetrievalAttempt[]
): Set<string> {
  const latestByMistake = new Map<string, RetrievalAttempt>();
  for (const attempt of attempts) {
    const existing = latestByMistake.get(attempt.mistakeId);
    if (
      !existing ||
      new Date(attempt.timestamp).getTime() >
        new Date(existing.timestamp).getTime()
    ) {
      latestByMistake.set(attempt.mistakeId, attempt);
    }
  }

  const dangerous = new Set<string>();
  latestByMistake.forEach((attempt, mistakeId) => {
    if (attempt.predictedConfidence === 3 && !attempt.wasCorrect) {
      dangerous.add(mistakeId);
    }
  });
  return dangerous;
}
