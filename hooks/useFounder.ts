"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getFounderProfile,
  getFounderState,
  getLatestFeedForward,
  getLessonReflections,
  getSubmission,
} from "@/lib/du/storage";
import type {
  AssignmentSubmission,
  FeedForwardReport,
  FounderProfile,
  FounderState,
  LessonReflections,
} from "@/lib/du/types";

export interface FounderSnapshot {
  /** False during SSR + first paint; gate localStorage-derived UI on this. */
  ready: boolean;
  profile: FounderProfile | null;
  submission: AssignmentSubmission | null;
  feedforward: FeedForwardReport | null;
  state: FounderState | null;
  reflections: LessonReflections;
  /** Re-read everything from localStorage (call after a save). */
  refresh: () => void;
}

/**
 * SSR-safe loader for the founder's whole Digital University snapshot. Reads
 * only after mount so server render and first client paint match (no hydration
 * mismatch), then exposes a `refresh()` to re-sync after writes.
 */
export function useFounder(): FounderSnapshot {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<FounderProfile | null>(null);
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [feedforward, setFeedforward] = useState<FeedForwardReport | null>(null);
  const [state, setState] = useState<FounderState | null>(null);
  const [reflections, setReflections] = useState<LessonReflections>({});

  const refresh = useCallback(() => {
    setProfile(getFounderProfile());
    setSubmission(getSubmission());
    setFeedforward(getLatestFeedForward());
    setState(getFounderState());
    setReflections(getLessonReflections());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ready, profile, submission, feedforward, state, reflections, refresh };
}
