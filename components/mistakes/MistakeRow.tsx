import Link from "next/link";
import type { Mistake } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface MistakeRowProps {
  mistake: Mistake;
  onMarkReviewed: (mistakeId: string) => void;
}

export default function MistakeRow({
  mistake,
  onMarkReviewed,
}: MistakeRowProps) {
  return (
    <div className="border-b border-neutral-200 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-1.5">
            <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
              {mistake.topicName}
            </span>
            <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
              {mistake.mistakeCategory}
            </span>
          </div>
          <p className="text-sm text-black line-clamp-2">
            {mistake.question}
          </p>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
            {mistake.studentAnswer}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="text-xs text-neutral-400">
            {formatDate(mistake.createdAt)}
          </span>
          {mistake.reviewed ? (
            <span className="text-xs text-neutral-400">Reviewed</span>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <Link
                href={`/review?mistakeId=${mistake.id}`}
                className="text-xs text-neutral-500 underline hover:text-black"
              >
                Review now
              </Link>
              <button
                type="button"
                onClick={() => onMarkReviewed(mistake.id)}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                mark as reviewed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
