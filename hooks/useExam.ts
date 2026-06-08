"use client";

import { useCallback, useEffect, useState } from "react";
import type { Exam } from "@/lib/types";
import { clearExam, getExam, saveExam } from "@/lib/storage";

export function useExam() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExam(getExam());
    setIsLoaded(true);
  }, []);

  const saveExamState = useCallback((nextExam: Exam) => {
    saveExam(nextExam);
    setExam(nextExam);
  }, []);

  const clearExamState = useCallback(() => {
    clearExam();
    setExam(null);
  }, []);

  return {
    exam,
    setExam: saveExamState,
    clearExamState,
    isLoaded,
  };
}
