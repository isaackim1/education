"use client";

import { useState } from "react";
import type { TopicCoverageRow } from "@/lib/dashboard-metrics";

const STATE_STYLES: Record<TopicCoverageRow["state"], string> = {
  "No materials": "bg-[#EFEBE2] text-[#56524B]",
  "Has materials": "bg-[#E7E3DA] text-[#1A1A17]",
  Practiced: "bg-[#E7E3DA] text-[#1A1A17]",
  Reviewed: "bg-[#E6F4EA] text-[#137333]",
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
    <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A17]">
            Topic coverage
          </h2>
          <p className="mt-1 text-sm text-[#56524B]">
            Materials, practice, and review combined. Weak areas appear first.
          </p>
        </div>
        {rows.length > 0 ? (
          <span className="rounded-full bg-[#EFEBE2] px-3 py-1 text-xs font-medium text-[#56524B]">
            {rows.length} topic{rows.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-xl bg-[#FAF8F4] px-4 py-4 text-sm text-[#56524B]">
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
                        <span className="rounded-full bg-[#EFEBE2] px-2.5 py-0.5 text-xs font-medium text-[#56524B]">
                          {row.unreviewedCount} to review
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[#56524B]">
                      {row.mistakeCount === 0
                        ? row.hasMaterials
                          ? "Ready for first practice"
                          : "Add material to ground training"
                        : `${row.reviewedCount} reviewed · ${row.unreviewedCount} unreviewed`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLES[row.state]}`}
                  >
                    {row.state}
                  </span>
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
              className="mt-4 inline-flex h-9 items-center rounded-full border border-[#D8D3C8] px-4 text-sm font-medium text-[#1A1A17] transition-colors duration-200 hover:bg-[#EFEBE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              {expanded ? "Show less" : `Show all ${rows.length} topics`}
              {!expanded ? (
                <span className="ml-2 text-xs text-[#7A766D]">
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
