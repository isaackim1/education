"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudySession } from "@/lib/types";
import { getSessions, saveSession, updateSession } from "@/lib/storage";

export function useSessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSessions(getSessions());
    setIsLoaded(true);
  }, []);

  const findSession = useCallback(
    (examId: string, day: number): StudySession | undefined => {
      return sessions.find((s) => s.examId === examId && s.day === day);
    },
    [sessions]
  );

  const saveSessionState = useCallback((session: StudySession) => {
    const saved = saveSession(session);
    if (saved) {
      setSessions((current) => {
        const index = current.findIndex((s) => s.id === session.id);
        if (index === -1) return [...current, session];
        return current.map((existing) =>
          existing.id === session.id ? session : existing
        );
      });
    }
    return saved;
  }, []);

  const updateSessionState = useCallback(
    (sessionId: string, updates: Partial<StudySession>) => {
      const saved = updateSession(sessionId, updates);
      if (saved) {
        setSessions((current) =>
          current.map((session) =>
            session.id === sessionId ? { ...session, ...updates } : session
          )
        );
      }
      return saved;
    },
    []
  );

  return {
    sessions,
    findSession,
    saveSessionState,
    updateSessionState,
    isLoaded,
  };
}
