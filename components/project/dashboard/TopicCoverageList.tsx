"use client";

import { useState } from "react";
import { outlineAction, Tag } from "@/components/ui/primitives";
import type { TopicCoverageRow } from "@/lib/dashboard-metrics";

const STATE_TONE: Record<
  TopicCoverageRow["state"],
  "neutral" | "blue" | "green"
> = {
  "No materials": "neutral",
  "Has materials": "neutral",
  Practiced: "blue",
  Scheduled: "green",
};

// Rows arrive already prioritized (weak / no-material first). Keep the dashboard
// short by showing only the top few; the rest expand on demand.
const COLLAPSED_COUNT = 4;

export default function TopicCoverageList({
  rows,
}: {
  rows: TopicCoverageRow[];
}) {
  const [expanded, setExpanded] = useState(false);

  const canCollapse = rows.length > COLLAPSED_COUNT;
  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_COUNT);
  const hiddenCount = rows.length - COLLAPSED_COUNT;

  return (
    <section className="h-full rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-[23px] leading-tight tracking-[-0.02em] text-[#1A1A17]">
            Topic coverage
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#56524B]">
            Materials, practice, and review combined. Weak areas appear first.
          </p>
        </div>
        {rows.length > 0 ? (
          <Tag tone="neutral">
            {rows.length} topic{rows.length === 1 ? "" : "s"}
          </Tag>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-xl border border-[#E7E3DA] bg-[#FAF8F4] px-4 py-4 text-sm text-[#56524B]">
          No topics yet. Add topics to build your training map.
        </p>
      ) : (
        <>
          <ul className="mt-5 space-y-3">
            {visibleRows.map((row) => (
              <li
                key={row.topicId}
                className="rounded-xl border border-[#E7E3DA] bg-[#FAF8F4] px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-medium text-[#1A1A17]">
                        {row.name}
                      </h3>
                      {row.isWeakArea ? (
                        <Tag tone="yellow">
                          {row.dueCount} due
                        </Tag>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[#56524B]">
                      {row.mistakeCount === 0
                        ? row.hasMaterials
                          ? "Ready for first practice"
                          : "Add material to ground training"
                        : `${row.scheduledCount} scheduled · ${row.dueCount} due`}
                    </p>
                  </div>
                  <Tag tone={STATE_TONE[row.state]}>{row.state}</Tag>
                </div>

                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E7E3DA]"
                  role="progressbar"
                  aria-label={`${row.name} coverage`}
                  aria-valuenow={row.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full ${
                      row.progressPercent === 100
                        ? "bg-[#137333]"
                        : "bg-[#56524B]"
                    }`}
                    style={{ width: `${row.progressPercent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          {canCollapse ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className={`mt-5 ${outlineAction}`}
            >
              {expanded ? "Show less" : `Show all ${rows.length} topics`}
              {!expanded ? (
                <span className="ml-2 font-mono text-xs text-[#7A766D]">
                  +{hiddenCount}
                </span>
              ) : null}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
