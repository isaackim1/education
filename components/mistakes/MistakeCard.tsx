import Link from "next/link";
import type { Mistake } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface MistakeCardProps {
  mistake: Mistake;
  onMarkReviewed: (mistakeId: string) => void;
}

export default function MistakeCard({
  mistake,
  onMarkReviewed,
}: MistakeCardProps) {
  return (
    <div className="border border-neutral-200 rounded p-4 space-y-3">
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
            {mistake.topicName}
          </span>
          <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
            {mistake.mistakeCategory}
          </span>
        </div>
        <span className="text-xs text-neutral-400 shrink-0">
          {formatDate(mistake.createdAt)}
        </span>
      </div>

      <div>
        <p className="text-xs font-medium text-neutral-500 mb-1">
          Question asked
        </p>
        <p className="text-sm text-neutral-600 line-clamp-2">
          {mistake.question}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-neutral-500 mb-1">Your answer</p>
        <p className="text-sm text-neutral-600 line-clamp-2">
          {mistake.studentAnswer}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-neutral-500 mb-1">
          Correct approach
        </p>
        <p className="text-sm text-black line-clamp-3">
          {mistake.correctApproach}
        </p>
      </div>

      <div>
        {mistake.reviewed ? (
          <span className="text-xs text-neutral-400">Reviewed</span>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href={`/review?mistakeId=${mistake.id}`}
              className="text-xs text-neutral-500 underline hover:text-black"
            >
              Review now
            </Link>
            <button
              type="button"
              onClick={() => onMarkReviewed(mistake.id)}
              className="text-xs text-neutral-400 hover:text-neutral-600"
            >
              mark as reviewed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
