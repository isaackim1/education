import type { Mistake } from "@/lib/types";
import { isScheduleDue } from "@/lib/scheduling";
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
        <span className="inline-flex items-center rounded-full bg-[#EFEBE2] px-2.5 py-0.5 text-xs text-[#56524B]">
          {mistake.topicName}
        </span>
        <span className="inline-flex items-center rounded-full bg-[#EFEBE2] px-2.5 py-0.5 text-xs text-[#56524B]">
          {mistake.mistakeCategory}
        </span>
        {isScheduleDue(mistake.schedule) ? (
          <span className="inline-flex items-center rounded-full bg-[#FEEFC3] px-2.5 py-0.5 text-xs font-medium text-[#B06000]">
            Due
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-[#EAF0EB] px-2.5 py-0.5 text-xs font-medium text-[#1E4634]">
            Scheduled
          </span>
        )}
      </div>

      {showQuestion && mistake.question ? (
        <div>
          <p className="text-xs font-medium text-[#56524B]">Question</p>
          <p className="text-sm text-[#1A1A17] mt-1 whitespace-pre-wrap">
            {mistake.question}
          </p>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium text-[#56524B]">What you answered</p>
        <p className="text-sm text-[#1A1A17] mt-1 whitespace-pre-wrap">
          {mistake.studentAnswer}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-[#56524B]">Better approach</p>
        <p className="text-sm text-[#1A1A17] mt-1 whitespace-pre-wrap">
          {mistake.correctApproach}
        </p>
      </div>

      {mistake.agentNote.trim() ? (
        <div>
          <p className="text-xs font-medium text-[#56524B]">Note</p>
          <p className="text-sm text-[#56524B] mt-1 whitespace-pre-wrap">
            {mistake.agentNote}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-[#7A766D]">
        {formatDate(mistake.createdAt)}
        {mistake.reviewCount > 0
          ? ` · Seen ${mistake.reviewCount}×`
          : ""}
        {!isScheduleDue(mistake.schedule) && mistake.schedule?.due
          ? ` · Next review ${formatDate(mistake.schedule.due)}`
          : ""}
      </p>
    </div>
  );
}
