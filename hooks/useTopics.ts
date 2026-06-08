"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Topic } from "@/lib/types";
import { getTopics, saveTopics, updateTopic } from "@/lib/storage";
import { computeWeakTopics } from "@/lib/utils";

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTopics(getTopics());
    setIsLoaded(true);
  }, []);

  const saveTopicsState = useCallback((nextTopics: Topic[]) => {
    saveTopics(nextTopics);
    setTopics(nextTopics);
  }, []);

  const updateTopicState = useCallback(
    (topicId: string, updates: Partial<Topic>) => {
      updateTopic(topicId, updates);
      setTopics(getTopics());
    },
    []
  );

  const weakTopics = useMemo(() => computeWeakTopics(topics), [topics]);

  return {
    topics,
    saveTopicsState,
    updateTopicState,
    weakTopics,
    isLoaded,
  };
}
