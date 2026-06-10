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
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-[#F1F3F4] px-2.5 py-0.5 text-xs text-[#5F6368]">
          {mistake.topicName}
        </span>
        <span className="inline-flex items-center rounded-full bg-[#F1F3F4] px-2.5 py-0.5 text-xs text-[#5F6368]">
          {mistake.mistakeCategory}
        </span>
        {mistake.reviewed ? (
          <span className="inline-flex items-center rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-xs font-medium text-[#137333]">
            Reviewed
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-[#FEEFC3] px-2.5 py-0.5 text-xs font-medium text-[#B06000]">
            Unreviewed
          </span>
        )}
      </div>

      {showQuestion && mistake.question ? (
        <div>
          <p className="text-xs font-medium text-[#5F6368]">Question</p>
          <p className="text-sm text-[#1F1F1F] mt-1 whitespace-pre-wrap">
            {mistake.question}
          </p>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium text-[#5F6368]">What you answered</p>
        <p className="text-sm text-[#1F1F1F] mt-1 whitespace-pre-wrap">
          {mistake.studentAnswer}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-[#5F6368]">Better approach</p>
        <p className="text-sm text-[#1F1F1F] mt-1 whitespace-pre-wrap">
          {mistake.correctApproach}
        </p>
      </div>

      {mistake.agentNote.trim() ? (
        <div>
          <p className="text-xs font-medium text-[#5F6368]">Note</p>
          <p className="text-sm text-[#5F6368] mt-1 whitespace-pre-wrap">
            {mistake.agentNote}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-[#80868B]">
        {formatDate(mistake.createdAt)}
        {mistake.reviewCount > 0
          ? ` · Reviewed ${mistake.reviewCount} time${mistake.reviewCount === 1 ? "" : "s"}`
          : ""}
      </p>
    </div>
  );
}
