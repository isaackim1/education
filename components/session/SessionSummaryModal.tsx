import type { SessionSummary } from "@/lib/types";

interface SessionSummaryModalProps {
  open: boolean;
  summary: SessionSummary | null;
  onClose: () => void;
  onBackToPlan: () => void;
}

export default function SessionSummaryModal({
  open,
  summary,
  onClose,
  onBackToPlan,
}: SessionSummaryModalProps) {
  if (!open || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white border border-neutral-200 rounded-lg max-w-md w-full p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Session complete</h2>

        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-neutral-700">Topics covered</p>
            <p className="text-neutral-600">
              {summary.topicsCovered.join(", ") || "None"}
            </p>
          </div>

          <div>
            <p className="font-medium text-neutral-700">Possible mistakes</p>
            <p className="text-neutral-600">{summary.newMistakeCount}</p>
          </div>

          <div>
            <p className="font-medium text-neutral-700">Tomorrow&apos;s focus</p>
            <p className="text-neutral-600">{summary.tomorrowFocus}</p>
          </div>

          <div>
            <p className="font-medium text-neutral-700">
              Tomorrow&apos;s session type
            </p>
            <p className="text-neutral-600 capitalize">
              {summary.tomorrowSessionType.replace("-", " ")}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-neutral-300 text-sm py-2 rounded hover:border-black"
          >
            Stay here
          </button>
          <button
            type="button"
            onClick={onBackToPlan}
            className="flex-1 bg-black text-white text-sm py-2 rounded hover:bg-neutral-800"
          >
            Back to Plan
          </button>
        </div>
      </div>
    </div>
  );
}
