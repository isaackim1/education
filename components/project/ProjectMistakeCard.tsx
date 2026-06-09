import type { Mistake } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ProjectMistakeCard({
  mistake,
  showQuestion = true,
}: {
  mistake: Mistake;
  showQuestion?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
          {mistake.topicName}
        </span>
        <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
          {mistake.mistakeCategory}
        </span>
        {mistake.reviewed ? (
          <span className="text-xs text-neutral-500">Reviewed</span>
        ) : (
          <span className="text-xs text-neutral-500">Unreviewed</span>
        )}
      </div>

      {showQuestion && mistake.question ? (
        <div>
          <p className="text-xs font-medium text-neutral-500">Question</p>
          <p className="text-sm text-black mt-1 whitespace-pre-wrap">
            {mistake.question}
          </p>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium text-neutral-500">What you answered</p>
        <p className="text-sm text-black mt-1 whitespace-pre-wrap">
          {mistake.studentAnswer}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-neutral-500">Better approach</p>
        <p className="text-sm text-black mt-1 whitespace-pre-wrap">
          {mistake.correctApproach}
        </p>
      </div>

      {mistake.agentNote.trim() ? (
        <div>
          <p className="text-xs font-medium text-neutral-500">Note</p>
          <p className="text-sm text-neutral-600 mt-1 whitespace-pre-wrap">
            {mistake.agentNote}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-neutral-400">
        {formatDate(mistake.createdAt)}
        {mistake.reviewCount > 0
          ? ` · Reviewed ${mistake.reviewCount} time${mistake.reviewCount === 1 ? "" : "s"}`
          : ""}
      </p>
    </div>
  );
}
