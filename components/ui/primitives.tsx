import type { ReactNode } from "react";

/**
 * Ivvy design language — warm-editorial visual foundation.
 *
 * Direction: Premium utilitarian minimalism + editorial grid (per the
 * minimalist-ui protocol) layered on the existing warm identity — warm
 * off-white paper, white cards, hairline borders, an editorial serif
 * (Newsreader) for display type, near-black warm ink, graphite secondary
 * text, muted spot pastels for semantic tags, and green reserved as a
 * status/progress signal.
 *
 * Skill-conformance rules baked in here so every screen inherits them:
 *   • No pill-shaped primary/secondary buttons — crisp 6px (`rounded-md`).
 *   • Cards cap at 12px radius (`rounded-xl`); pills reserved for small tags.
 *   • Borders are a single 1px hairline; shadows are near-invisible (< 0.05).
 *
 * These are presentational primitives only — no product logic, no storage, no
 * network. Colours live here as the single source of truth so pages stay
 * consistent.
 */

// ── Palette (ivory + forest + ink) ───────────────────────────────────────────
export const ink = "#1A1A17"; // primary text
export const graphite = "#56524B"; // secondary text
export const muted = "#7A766D"; // metadata / captions
export const paper = "#FAF8F4"; // app background (ivory)
export const panel = "#F4F1EA"; // warm tonal surface
export const border = "#E7E3DA"; // hairline border
export const borderStrong = "#D8D3C8"; // input / interactive border
export const forest = "#1E4634"; // primary action + Ivvy's guidance
export const forestDeep = "#16382A"; // hover/active on forest
export const forestTint = "#EAF0EB"; // subtle forest fill (scheduled, selected)
export const clay = "#9C4126"; // high-risk only: certain + wrong
export const clayTint = "#F6EAE4"; // high-risk tag background
export const signal = forest; // legacy alias

// ── Spot pastels (semantic tags / accents, used sparingly) ───────────────────
export const accent = {
  red: { bg: "#FDEBEC", text: "#9F2F2D" },
  blue: { bg: "#E1F3FE", text: "#1F6C9F" },
  green: { bg: "#EDF3EC", text: "#346538" },
  yellow: { bg: "#FBF3DB", text: "#956400" },
} as const;

// ── Shared control classes ───────────────────────────────────────────────────
// Crisp 6px radius, solid ink, subtle scale on press. No pills, no shadows.
export const primaryAction =
  "inline-flex h-10 items-center justify-center rounded-md bg-[#1E4634] px-6 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#16382A] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

export const outlineAction =
  "inline-flex h-10 items-center justify-center rounded-md border border-[#D8D3C8] px-5 text-sm font-medium text-[#1A1A17] transition-[background-color,transform] duration-200 hover:bg-[#EFEBE2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

export const ghostLink =
  "inline-flex h-9 items-center rounded-md px-3 text-sm text-[#56524B] transition-colors duration-200 hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

export const field =
  "w-full rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#9B968D] transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/10";

// ── Layout ───────────────────────────────────────────────────────────────────
export function PageShell({
  children,
  width = "max-w-5xl",
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className={`mx-auto ${width} px-5 py-10 sm:py-14`}>{children}</div>
    </main>
  );
}

export function CenteredNotice({
  children,
  label = "Loading",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F4]">
      <p className="text-sm text-[#56524B]" role="status" aria-label={label}>
        {children}
      </p>
    </main>
  );
}

// ── Editorial type fragments ─────────────────────────────────────────────────
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]">
      {children}
    </p>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 sm:mb-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="mt-2.5 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[#1A1A17] sm:text-[32px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3.5 text-[15px] leading-relaxed text-[#56524B]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-1.5 text-[20px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[#56524B]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-[#E7E3DA] ${className}`} />;
}

// ── Surfaces ─────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
  tone = "card",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: "card" | "panel";
  interactive?: boolean;
}) {
  const surface =
    tone === "panel"
      ? "bg-[#F4F1EA] border-[#E7E3DA]"
      : "bg-white border-[#E7E3DA]";
  // Skill motion: cards lift with an ultra-subtle shadow shift, never a heavy
  // drop shadow.
  const motion = interactive
    ? "transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-px hover:border-[#D8D3C8] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    : "";
  return (
    <section
      className={`rounded-xl border ${surface} ${motion} p-5 sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

// A featured, editorial "what to do next" card.
export function PrimaryActionCard({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#D8D3C8] bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="mt-2 text-[20px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 sm:p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A766D]">
        {label}
      </p>
      <p className="mt-2 text-[28px] font-medium leading-none tracking-[-0.01em] text-[#1A1A17] tabular-nums">
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-xs leading-relaxed text-[#7A766D]">{detail}</p>
      ) : null}
    </div>
  );
}

// ── Status & tags ────────────────────────────────────────────────────────────
type PillTone = "neutral" | "success" | "warning";

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: PillTone;
}) {
  const tones: Record<PillTone, string> = {
    neutral: "bg-[#F4F1EA] text-[#56524B]",
    success: "bg-[#EAF0EB] text-[#1E4634]",
    warning: "bg-[#F7ECD0] text-[#9A6700]",
  };
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Editorial tag — small, uppercase, wide tracking, muted spot pastel. Pills are
// allowed here (the skill reserves pill shapes for tags/badges only).
type TagTone =
  | "neutral"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "clay"
  | "forest";

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: TagTone;
}) {
  const tones: Record<TagTone, string> = {
    neutral: "bg-[#F4F1EA] text-[#56524B]",
    red: "bg-[#FDEBEC] text-[#9F2F2D]",
    blue: "bg-[#E1F3FE] text-[#1F6C9F]",
    green: "bg-[#EAF0EB] text-[#1E4634]",
    yellow: "bg-[#FBF3DB] text-[#956400]",
    // High-risk only: a mistake missed while the student felt certain.
    clay: "bg-[#F6EAE4] text-[#9C4126]",
    // Scheduled / on-track — Ivvy's guidance tone.
    forest: "bg-[#EAF0EB] text-[#1E4634]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Physical keystroke, for keyboard hints.
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-[#E7E3DA] bg-[#F7F6F3] px-1.5 font-mono text-[11px] leading-none text-[#56524B]">
      {children}
    </kbd>
  );
}

// Minimalist faux-OS window chrome — a white bar with three light-gray macOS
// controls. Use only to frame a genuine preview/mockup surface.
export function WindowChrome({
  children,
  label,
}: {
  children: ReactNode;
  label?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E7E3DA] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E7E3DA] bg-[#F7F6F3] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E0DCD2]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E0DCD2]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E0DCD2]" />
        </span>
        {label ? (
          <span className="ml-2 font-mono text-[11px] text-[#9B968D]">
            {label}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-dashed border-[#D8D3C8] bg-white px-6 py-16 text-center">
      <h2 className="text-[20px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-[#56524B]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
    </section>
  );
}
