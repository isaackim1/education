"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudyPlan } from "@/lib/types";
import { getStudyPlan, saveStudyPlan } from "@/lib/storage";

export function useStudyPlan() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setStudyPlan(getStudyPlan());
    setIsLoaded(true);
  }, []);

  const saveStudyPlanState = useCallback((plan: StudyPlan) => {
    const saved = saveStudyPlan(plan);
    if (saved) {
      setStudyPlan(plan);
    }
    return saved;
  }, []);

  return {
    studyPlan,
    saveStudyPlanState,
    isLoaded,
  };
}
