import type { ReactNode } from "react";

/**
 * Ivvy design language — Phase 13A visual foundation.
 *
 * A lightweight, warm-editorial system layered on the existing Tailwind setup.
 * Direction (from the UI/UX Pro Max design intelligence pass): Swiss Modernism
 * 2.0 + Editorial Grid — warm off-white paper, white cards, hairline borders,
 * a serif display face for headings, near-black ink, graphite secondary text,
 * and green used only as a status/progress signal. No blue. No decoration.
 *
 * These are presentational primitives only — no product logic, no storage, no
 * network. Colours live here as the single source of truth so priority pages
 * stay consistent.
 */

// ── Palette (warm neutral, no blue) ──────────────────────────────────────────
export const ink = "#1A1A17"; // primary text + primary action
export const graphite = "#56524B"; // secondary text
export const muted = "#7A766D"; // metadata / captions
export const paper = "#FAF8F4"; // app background (warm off-white)
export const panel = "#F4F1EA"; // warm tonal surface
export const border = "#E7E3DA"; // hairline border
export const borderStrong = "#D8D3C8"; // input / interactive border
export const signal = "#137333"; // green — status & progress only

// ── Shared control classes ───────────────────────────────────────────────────
export const primaryAction =
  "inline-flex h-10 items-center justify-center rounded-full bg-[#1A1A17] px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

export const outlineAction =
  "inline-flex h-10 items-center justify-center rounded-full border border-[#D8D3C8] px-5 text-sm font-medium text-[#1A1A17] transition-colors duration-200 hover:bg-[#EFEBE2] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

export const ghostLink =
  "inline-flex h-9 items-center rounded-full px-3 text-sm text-[#56524B] transition-colors duration-200 hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

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
          <h1 className="mt-2.5 font-serif text-[34px] leading-[1.08] tracking-[-0.01em] text-[#1A1A17] sm:text-[40px]">
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
        <h2 className="mt-1.5 font-serif text-[22px] leading-tight tracking-[-0.01em] text-[#1A1A17]">
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
}: {
  children: ReactNode;
  className?: string;
  tone?: "card" | "panel";
}) {
  const surface =
    tone === "panel"
      ? "bg-[#F4F1EA] border-[#E7E3DA]"
      : "bg-white border-[#E7E3DA]";
  return (
    <section
      className={`rounded-2xl border ${surface} p-5 sm:p-6 ${className}`}
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
    <section className="rounded-2xl border border-[#D8D3C8] bg-white p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="mt-2 font-serif text-[24px] leading-tight tracking-[-0.01em] text-[#1A1A17]">
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
    <div className="rounded-2xl border border-[#E7E3DA] bg-white p-4 sm:p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A766D]">
        {label}
      </p>
      <p className="mt-2 font-serif text-[30px] leading-none tracking-[-0.01em] text-[#1A1A17] tabular-nums">
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-xs leading-relaxed text-[#7A766D]">{detail}</p>
      ) : null}
    </div>
  );
}

// ── Status ───────────────────────────────────────────────────────────────────
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
    success: "bg-[#E7F0E9] text-[#137333]",
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
    <section className="rounded-2xl border border-dashed border-[#D8D3C8] bg-white px-6 py-16 text-center">
      <h2 className="font-serif text-[22px] leading-tight tracking-[-0.01em] text-[#1A1A17]">
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
