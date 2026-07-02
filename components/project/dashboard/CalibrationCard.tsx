import type { CalibrationMetrics } from "@/lib/calibration";
import { MIN_CALIBRATION_ATTEMPTS } from "@/lib/calibration";
import { Eyebrow } from "@/components/ui/primitives";

/**
 * Calibration — the confidence-vs-performance gap (RESEARCH.md §5). Surfaced
 * calmly and readiness-framed: no badges, streaks, or gamification. Renders an
 * instructional state until there's enough data, then the score and a plain-
 * language read of where the student most overestimates themselves.
 *
 * The parent only mounts this once at least one attempt exists, so we never
 * assume `attemptCount === 0` here.
 */

type TopicRef = { id: string; name: string };

// Below this the difference is noise, not a real over/under-confidence lean.
const LEAN_THRESHOLD = 0.1;

function pluralWas(count: number): string {
  return count === 1 ? "was" : "were";
}

function toneFor(index: number): "over" | "under" | "even" {
  if (index > LEAN_THRESHOLD) return "over";
  if (index < -LEAN_THRESHOLD) return "under";
  return "even";
}

export default function CalibrationCard({
  metrics,
  topics,
}: {
  metrics: CalibrationMetrics;
  topics: TopicRef[];
}) {
  if (!metrics.hasEnoughData) {
    const remaining = MIN_CALIBRATION_ATTEMPTS - metrics.attemptCount;
    const percent = Math.round(
      (metrics.attemptCount / MIN_CALIBRATION_ATTEMPTS) * 100
    );
    return (
      <section className="h-full rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-7">
        <Eyebrow>Calibration</Eyebrow>
        <h2 className="mt-2 font-serif text-[23px] leading-tight tracking-[-0.02em] text-[#1A1A17]">
          How well do you know what you know?
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#56524B]">
          Tap how sure you are before checking each answer in review. After{" "}
          {MIN_CALIBRATION_ATTEMPTS} rated answers, Ivvy shows the gap between how
          confident you feel and how often you&apos;re actually right — the
          blind spot behind most exam surprises.
        </p>
        <div className="mt-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFEBE2]">
            <div
              className="h-full rounded-full bg-[#137333] transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#7A766D]">
            {metrics.attemptCount} of {MIN_CALIBRATION_ATTEMPTS} rated ·{" "}
            {remaining} to go
          </p>
        </div>
      </section>
    );
  }

  const tone = toneFor(metrics.overconfidenceIndex);
  const topicName = metrics.mostOverconfidentTopicId
    ? topics.find((t) => t.id === metrics.mostOverconfidentTopicId)?.name ?? null
    : null;

  const leanLine =
    tone === "over"
      ? "You tend to feel surer than you turn out to be — the classic illusion of competence."
      : tone === "under"
        ? "You know more than you give yourself credit for. Trust your preparation."
        : "Your confidence tracks your performance closely. That's exactly what you want going into an exam.";

  return (
    <section className="h-full rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-7">
      <Eyebrow>Calibration</Eyebrow>
      <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="shrink-0">
          <p className="font-serif text-[44px] leading-none tracking-[-0.02em] text-[#1A1A17] tabular-nums">
            {metrics.calibrationScore}%
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A766D]">
            Calibrated
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-[#1A1A17]">{leanLine}</p>

          {metrics.feltSureCount > 0 ? (
            <p className="text-sm leading-relaxed text-[#56524B]">
              You felt certain on {metrics.feltSureCount} answer
              {metrics.feltSureCount === 1 ? "" : "s"} —{" "}
              <span className="text-[#1A1A17]">
                {metrics.feltSureButWrongCount}{" "}
                {pluralWas(metrics.feltSureButWrongCount)} wrong
              </span>
              .
            </p>
          ) : null}

          {tone === "over" && topicName ? (
            <p className="text-sm leading-relaxed text-[#56524B]">
              You most overestimate yourself on{" "}
              <span className="text-[#1A1A17]">{topicName}</span>. Ivvy brings
              those mistakes back first.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
