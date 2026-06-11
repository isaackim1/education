"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProjectGoals } from "@/lib/types";
import { getProjectGoals, saveProjectGoals } from "@/lib/project-storage";

export const DEFAULT_GOAL_VALUES = {
  weeklySessionGoal: 3,
  weeklyReviewGoal: 10,
  currentConfidence: 3 as 1 | 2 | 3 | 4 | 5,
};

const MAX_WEEKLY_SESSION_GOAL = 50;
const MAX_WEEKLY_REVIEW_GOAL = 200;

function sanitizeGoal(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.floor(value)));
}

function sanitizeConfidence(value: number): 1 | 2 | 3 | 4 | 5 {
  return Number.isInteger(value) && value >= 1 && value <= 5
    ? (value as 1 | 2 | 3 | 4 | 5)
    : DEFAULT_GOAL_VALUES.currentConfidence;
}

export function useProjectGoals(projectId: string) {
  const [goals, setGoals] = useState<ProjectGoals | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshGoals = useCallback(() => {
    setGoals(getProjectGoals(projectId));
  }, [projectId]);

  useEffect(() => {
    refreshGoals();
    setIsLoaded(true);
  }, [refreshGoals]);

  const saveGoals = useCallback(
    (input: {
      weeklySessionGoal: number;
      weeklyReviewGoal: number;
      focusTopicIds: string[];
      currentConfidence: 1 | 2 | 3 | 4 | 5;
    }) => {
      const next: ProjectGoals = {
        projectId,
        weeklySessionGoal: sanitizeGoal(
          input.weeklySessionGoal,
          MAX_WEEKLY_SESSION_GOAL
        ),
        weeklyReviewGoal: sanitizeGoal(
          input.weeklyReviewGoal,
          MAX_WEEKLY_REVIEW_GOAL
        ),
        focusTopicIds: Array.from(
          new Set(
            Array.isArray(input.focusTopicIds)
              ? input.focusTopicIds.filter(
                  (topicId): topicId is string => typeof topicId === "string"
                )
              : []
          )
        ),
        currentConfidence: sanitizeConfidence(input.currentConfidence),
        updatedAt: new Date().toISOString(),
      };
      saveProjectGoals(projectId, next);
      setGoals(next);
    },
    [projectId]
  );

  return { goals, isLoaded, saveGoals, refreshGoals };
}
