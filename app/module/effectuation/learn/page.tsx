"use client";

import { useEffect, useMemo, useState } from "react";
import { useFounder } from "@/hooks/useFounder";
import {
  du,
  DuButton,
  DuCard,
  DuProgressBar,
  DuShell,
  DuTag,
  Eyebrow,
} from "@/components/du/ui";
import { EFFECTUATION_MODULE, getConcepts } from "@/data/unknown/effectuation";
import {
  getFounderState,
  saveFounderState,
  saveLessonReflection,
} from "@/lib/du/storage";
import { createInitialFounderState } from "@/lib/du/progress";

export default function EffectuationLearnPage() {
  const { ready, profile, reflections, refresh } = useFounder();
  const concepts = useMemo(
    () => getConcepts(EFFECTUATION_MODULE.conceptIds),
    [],
  );

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  const active = concepts[index];

  // Load the saved reflection for the active concept once storage is ready.
  useEffect(() => {
    if (!ready || !active) return;
    setDraft(reflections[active.id] ?? "");
    setSaved(false);
  }, [ready, active, reflections]);

  const completedCount = concepts.filter((c) =>
    (reflections[c.id] ?? "").trim(),
  ).length;
  const percent = concepts.length
    ? Math.round((completedCount / concepts.length) * 100)
    : 0;

  function handleSave() {
    if (!active) return;
    saveLessonReflection(active.id, draft.trim());
    bumpLearningState(profile?.id);
    setSaved(true);
    refresh();
  }

  function goTo(next: number) {
    if (next < 0 || next >= concepts.length) return;
    setIndex(next);
  }

  if (!active) {
    return (
      <DuShell>
        <DuCard>Loading lessons…</DuCard>
      </DuShell>
    );
  }

  const isLast = index === concepts.length - 1;

  return (
    <DuShell width="max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Eyebrow>Effectuation Roadmap · Learn</Eyebrow>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Apply the founder&apos;s logic to your venture
          </h1>
        </div>
        <DuTag tone="active">
          {completedCount}/{concepts.length} applied
        </DuTag>
      </div>

      <div className="mb-6">
        <DuProgressBar percent={percent} />
      </div>

      {/* Concept stepper dots */}
      <div className="mb-6 flex flex-wrap gap-2">
        {concepts.map((c, i) => {
          const done = (reflections[c.id] ?? "").trim().length > 0;
          const current = i === index;
          return (
            <button
              key={c.id}
              onClick={() => goTo(i)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                current
                  ? "border-[#0B0B0C] bg-[#0B0B0C] text-white"
                  : done
                    ? "border-[#0B0B0C] bg-white text-[#0B0B0C]"
                    : "border-[#D8D2C2] bg-white text-[#8A8579] hover:text-[#0B0B0C]"
              }`}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rotate-45"
                style={{
                  background: done || current ? du.yellow : "#C9C3B4",
                }}
              />
              {i + 1}
            </button>
          );
        })}
      </div>

      <DuCard className="border-2 border-[#0B0B0C]">
        <div className="flex items-center gap-2">
          <DuTag tone="neutral">Concept {index + 1}</DuTag>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A8A296]">
            {active.sourceLabel}
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight">
          {active.title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#3A372F]">
          {active.summary}
        </p>

        <div className="mt-5 rounded-lg bg-[#0B0B0C] p-5">
          <Eyebrow onDark>The Unknown take</Eyebrow>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            {active.unknownStyleInterpretation}
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B675D]">
              Founder application
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#3A372F]">
              {active.founderApplication}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B675D]">
              Watch out for
            </p>
            <ul className="mt-2 space-y-1.5">
              {active.commonMistakes.map((m, i) => (
                <li key={i} className="text-sm leading-relaxed text-[#56524B]">
                  — {m}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Apply to your venture */}
        <div className="mt-6 rounded-lg border-2 border-[#F5D11E] bg-[#FBEFB8]/40 p-5">
          <Eyebrow>Apply this to your venture</Eyebrow>
          <p className="mt-2 text-sm text-[#56524B]">
            {profile
              ? `How does "${active.title}" change your next move on ${profile.ventureName}?`
              : "Write how this concept changes your next move. (Tip: set up your venture in the Studio to make this concrete.)"}
          </p>
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setSaved(false);
            }}
            rows={4}
            placeholder="One real, specific application to your venture…"
            className="mt-3 w-full rounded-lg border border-[#D8D2C2] bg-white px-4 py-3 text-sm text-[#0B0B0C] placeholder:text-[#A8A296] focus-visible:border-[#0B0B0C] focus-visible:outline-none"
          />
          <div className="mt-3 flex items-center gap-3">
            <DuButton variant="primary" onClick={handleSave}>
              Save reflection
            </DuButton>
            {saved ? (
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#137333]">
                Saved ✓
              </span>
            ) : null}
          </div>
        </div>
      </DuCard>

      {/* Mentor questions */}
      <DuCard className="mt-5" tone="card">
        <Eyebrow>A mentor would ask</Eyebrow>
        <ul className="mt-3 space-y-2">
          {active.mentorQuestions.map((q, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-[#3A372F]">
              <span aria-hidden className="mt-[7px] h-2 w-2 shrink-0 rotate-45 bg-[#F5D11E]" />
              {q}
            </li>
          ))}
        </ul>
      </DuCard>

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <DuButton
          variant="ghost"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          ← Previous
        </DuButton>
        {isLast ? (
          <DuButton href="/module/effectuation/studio" variant="accent">
            Build your roadmap →
          </DuButton>
        ) : (
          <DuButton variant="primary" onClick={() => goTo(index + 1)}>
            Next concept →
          </DuButton>
        )}
      </div>
    </DuShell>
  );
}

/**
 * Move the founder into the "learning" phase the first time they engage, without
 * regressing anyone who is already further along.
 */
function bumpLearningState(profileId?: string) {
  const existing = getFounderState();
  if (!existing) {
    saveFounderState({
      ...createInitialFounderState(profileId ?? "anonymous"),
      progressState: "learning_concept",
      currentStepId: "start-with-means",
    });
    return;
  }
  if (existing.progressState === "not_started") {
    saveFounderState({
      ...existing,
      progressState: "learning_concept",
      currentStepId: "start-with-means",
    });
  }
}
