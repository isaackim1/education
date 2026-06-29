"use client";

import { useFounder } from "@/hooks/useFounder";
import {
  DuButton,
  DuCard,
  DuProgressBar,
  DuShell,
  DuTag,
  Eyebrow,
  SectionTitle,
} from "@/components/du/ui";
import {
  EFFECTUATION_MODULE,
  ENTREPRENEURSHIP_PROGRAM,
  EFFECTUATION_SECTION_IDS,
} from "@/data/unknown/effectuation";
import {
  deriveSubmissionCompleteness,
  moduleProgressPercent,
} from "@/lib/du/progress";

export default function ProgramPage() {
  const { ready, submission, state, reflections } = useFounder();

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

  const modules = ENTREPRENEURSHIP_PROGRAM.modules;

  return (
    <DuShell>
      <SectionTitle
        eyebrow="Digital University · Program"
        title={ENTREPRENEURSHIP_PROGRAM.title}
        description={ENTREPRENEURSHIP_PROGRAM.tagline}
      />

      <DuCard tone="ink" className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow onDark>The path</Eyebrow>
            <p className="mt-2 text-[15px] leading-relaxed text-white/75">
              Seven modules, one venture. You unlock the next module by building —
              not by passing a test. Every step pushes a concept onto the company
              you&apos;re actually starting.
            </p>
          </div>
          <DuButton href="/module/effectuation" variant="accent">
            Enter active module →
          </DuButton>
        </div>
      </DuCard>

      <ol className="space-y-3">
        {modules.map((module, index) => {
          const isActive = module.status === "active";
          return (
            <li key={module.id}>
              <DuCard
                className={
                  isActive ? "border-2 border-[#0B0B0C]" : "opacity-90"
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center text-sm font-black ${
                        isActive
                          ? "bg-[#F5D11E] text-[#0B0B0C]"
                          : "bg-[#EDE8DA] text-[#8A8579]"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black tracking-tight">
                          {module.title}
                        </h3>
                        {isActive ? (
                          <DuTag tone="active">Active</DuTag>
                        ) : (
                          <DuTag tone="locked">🔒 Locked</DuTag>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#56524B]">
                        {module.tagline}
                      </p>
                      {isActive ? (
                        <div className="mt-3 max-w-xs">
                          <DuProgressBar percent={ready ? percent : 0} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 sm:pl-4">
                    {isActive ? (
                      <DuButton href="/module/effectuation" variant="primary">
                        Open
                      </DuButton>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#A8A296]">
                        Unlocks next
                      </span>
                    )}
                  </div>
                </div>
              </DuCard>
            </li>
          );
        })}
      </ol>
    </DuShell>
  );
}
