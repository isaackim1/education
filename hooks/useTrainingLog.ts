"use client";

import { useCallback, useEffect, useState } from "react";
import type { TrainingSession, TrainingSessionType } from "@/lib/types";
import {
  addTrainingSession,
  deleteTrainingSession,
  getTrainingLog,
} from "@/lib/project-storage";

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

export type LogSessionInput = {
  type: TrainingSessionType;
  topicId: string | null;
  durationMinutes: number;
  note: string;
  confidenceAfter: 1 | 2 | 3 | 4 | 5 | null;
};

const MAX_SESSION_DURATION_MINUTES = 600;

function sanitizeDuration(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(
    MAX_SESSION_DURATION_MINUTES,
    Math.max(0, Math.floor(value))
  );
}

function sanitizeConfidence(
  value: number | null
): 1 | 2 | 3 | 4 | 5 | null {
  return value !== null &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
    ? (value as 1 | 2 | 3 | 4 | 5)
    : null;
}

export function useTrainingLog(projectId: string) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshSessions = useCallback(() => {
    setSessions(getTrainingLog(projectId));
  }, [projectId]);

  useEffect(() => {
    refreshSessions();
    setIsLoaded(true);
  }, [refreshSessions]);

  const logSession = useCallback(
    (input: LogSessionInput) => {
      const session: TrainingSession = {
        id: generateId(),
        projectId,
        type: input.type,
        topicId: typeof input.topicId === "string" ? input.topicId : null,
        durationMinutes: sanitizeDuration(input.durationMinutes),
        note: typeof input.note === "string" ? input.note.trim() : "",
        confidenceAfter: sanitizeConfidence(input.confidenceAfter),
        loggedAt: new Date().toISOString(),
      };
      addTrainingSession(projectId, session);
      refreshSessions();
    },
    [projectId, refreshSessions]
  );

  const removeSession = useCallback(
    (sessionId: string) => {
      deleteTrainingSession(projectId, sessionId);
      refreshSessions();
    },
    [projectId, refreshSessions]
  );

  return { sessions, isLoaded, logSession, removeSession, refreshSessions };
}
