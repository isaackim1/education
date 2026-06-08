"use client";

import { useCallback, useEffect, useState } from "react";
import type { Mistake } from "@/lib/types";
import { getMistakes, saveMistake, updateMistake } from "@/lib/storage";
import { getNextReviewDate } from "@/lib/utils";

export function useMistakes() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setMistakes(getMistakes());
    setIsLoaded(true);
  }, []);

  const saveMistakeState = useCallback((mistake: Mistake) => {
    saveMistake(mistake);
    setMistakes(getMistakes());
  }, []);

  const markReviewed = useCallback((mistakeId: string) => {
    const current = getMistakes().find((m) => m.id === mistakeId);
    if (!current || current.reviewed) return;
    const newCount = current.reviewCount + 1;
    updateMistake(mistakeId, {
      reviewed: true,
      reviewCount: newCount,
      lastReviewed: new Date().toISOString(),
      nextReviewDate: getNextReviewDate(newCount),
    });
    setMistakes(getMistakes());
  }, []);

  return { mistakes, saveMistakeState, markReviewed, isLoaded };
}
