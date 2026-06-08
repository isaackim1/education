import type { Topic } from "@/lib/types";

interface MasteryStripProps {
  topics: Topic[];
}

export default function MasteryStrip({ topics }: MasteryStripProps) {
  if (topics.length === 0) return null;

  return (
    <div className="border border-neutral-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold mb-3">Topic mastery</h2>
      <div className="space-y-2">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-neutral-800">{topic.name}</span>
            <div className="flex items-center gap-2">
              {topic.masteryScore <= 2 && (
                <span className="text-xs font-medium text-red-600 border border-red-200 rounded px-1.5 py-0.5">
                  Weak
                </span>
              )}
              <span className="text-xs text-neutral-500 tabular-nums">
                {topic.masteryScore}/5
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
