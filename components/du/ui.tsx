import Link from "next/link";
import type { ReactNode } from "react";
import DuNavServer from "./DuNav";

/**
 * Unknown Digital University — design primitives (Phase DU-1A).
 *
 * A separate, intentionally bolder visual system from the Ivvy exam-coach
 * primitives (components/ui/primitives.tsx). Direction: founder-campus energy —
 * near-black ink, warm off-white paper, one punchy yellow signal accent, large
 * heavy typography, hard edges over soft ones. Layered on the existing Tailwind
 * setup (Inter via --font-inter). No new dependencies, no shadcn/MUI.
 *
 * Presentational only: no hooks here, so these can be imported by both server
 * and client components. The active-route nav lives in DuNav (a client file).
 */

// ── Tokens ───────────────────────────────────────────────────────────────────
export const du = {
  ink: "#0B0B0C", // near-black — text + dark surfaces
  paper: "#F3F0E6", // warm off-white — app background
  card: "#FFFFFF",
  yellow: "#F5D11E", // signal accent — use with intent
  yellowSoft: "#FBEFB8",
  line: "#E2DCCD", // hairline on paper
  lineDark: "rgba(255,255,255,0.14)", // hairline on ink
  muted: "#6B675D",
} as const;

// ── Layout ───────────────────────────────────────────────────────────────────
export function DuShell({
  children,
  width = "max-w-6xl",
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="min-h-screen bg-[#F3F0E6] text-[#0B0B0C]">
      <DuNavServer />
      <main className={`mx-auto ${width} px-5 py-10 sm:px-6 sm:py-14`}>
        {children}
      </main>
      <DuFooter />
    </div>
  );
}

function DuFooter() {
  return (
    <footer className="border-t border-[#E2DCCD] bg-[#F3F0E6]">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-8 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B675D]">
          Unknown Digital University
        </p>
        <p className="text-xs text-[#6B675D]">
          A digital campus for founders. Build from day one — applied learning,
          not theoretical exams.
        </p>
      </div>
    </footer>
  );
}

// ── Type fragments ───────────────────────────────────────────────────────────
export function Eyebrow({
  children,
  onDark = false,
}: {
  children: ReactNode;
  onDark?: boolean;
}) {
  return (
    <p
      className={`text-[11px] font-bold uppercase tracking-[0.24em] ${
        onDark ? "text-[#F5D11E]" : "text-[#6B675D]"
      }`}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
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
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0B0B0C] sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-[15px] leading-relaxed text-[#56524B]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "accent" | "outline" | "ghost";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B0B0C] focus-visible:ring-offset-[#F3F0E6]";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-[#0B0B0C] text-white hover:bg-black",
  accent: "bg-[#F5D11E] text-[#0B0B0C] hover:bg-[#ecc40d]",
  outline:
    "border-2 border-[#0B0B0C] bg-transparent text-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white",
  ghost: "text-[#0B0B0C] hover:bg-[#E7E2D3]",
};

export function DuButton({
  children,
  href,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const cls = `${buttonBase} ${buttonVariants[variant]} ${className}`;
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

// ── Surfaces ─────────────────────────────────────────────────────────────────
export function DuCard({
  children,
  className = "",
  tone = "card",
}: {
  children: ReactNode;
  className?: string;
  tone?: "card" | "ink" | "yellow";
}) {
  const tones: Record<string, string> = {
    card: "bg-white border border-[#E2DCCD] text-[#0B0B0C]",
    ink: "bg-[#0B0B0C] border border-[#0B0B0C] text-white",
    yellow: "bg-[#F5D11E] border border-[#F5D11E] text-[#0B0B0C]",
  };
  return (
    <section className={`rounded-xl p-5 sm:p-6 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}

// ── Tags / pills ─────────────────────────────────────────────────────────────
export function DuTag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "active" | "locked" | "accent";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[#EDE8DA] text-[#56524B]",
    active: "bg-[#0B0B0C] text-[#F5D11E]",
    locked: "bg-transparent text-[#8A8579] border border-[#D8D2C2]",
    accent: "bg-[#F5D11E] text-[#0B0B0C]",
  };
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// ── Progress ─────────────────────────────────────────────────────────────────
export function DuProgressBar({
  percent,
  onDark = false,
}: {
  percent: number;
  onDark?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full ${
        onDark ? "bg-white/15" : "bg-[#E2DCCD]"
      }`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-[#F5D11E] transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function DuStat({
  label,
  value,
  detail,
  onDark = false,
}: {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  onDark?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
          onDark ? "text-white/60" : "text-[#6B675D]"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1.5 text-3xl font-black tabular-nums tracking-tight ${
          onDark ? "text-white" : "text-[#0B0B0C]"
        }`}
      >
        {value}
      </p>
      {detail ? (
        <p
          className={`mt-1 text-xs ${onDark ? "text-white/55" : "text-[#6B675D]"}`}
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}

// ── Empty / loading ──────────────────────────────────────────────────────────
export function DuEmpty({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border-2 border-dashed border-[#D8D2C2] bg-white px-6 py-14 text-center">
      <h3 className="text-xl font-black tracking-tight text-[#0B0B0C]">
        {title}
      </h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#56524B]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </section>
  );
}

// ── List with yellow ticks ───────────────────────────────────────────────────
export function DuTickList({
  items,
  onDark = false,
}: {
  items: string[];
  onDark?: boolean;
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="mt-[7px] h-2 w-2 shrink-0 rotate-45 bg-[#F5D11E]"
          />
          <span
            className={`text-sm leading-relaxed ${
              onDark ? "text-white/85" : "text-[#3A372F]"
            }`}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
