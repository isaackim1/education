"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudyProject, Topic } from "@/lib/types";
import {
  getProject,
  getProjectMaterials,
  getProjectTopics,
  saveProject,
  saveProjectMaterials,
  saveProjectTopics,
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

export function useProject(projectId: string) {
  const [project, setProject] = useState<StudyProject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshProject = useCallback(() => {
    setProject(getProject(projectId));
    setTopics(getProjectTopics(projectId));
  }, [projectId]);

  useEffect(() => {
    refreshProject();
    setIsLoaded(true);
  }, [refreshProject]);

  const addTopic = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const normalized = trimmed.toLocaleLowerCase();
      const current = getProjectTopics(projectId);
      if (
        current.some((t) => t.name.toLocaleLowerCase() === normalized)
      ) {
        return;
      }

      const topic: Topic = {
        id: generateId(),
        examId: projectId,
        name: trimmed,
        masteryScore: 0,
        isWeakTopic: false,
        mistakeCount: 0,
        lastStudied: null,
        masteryHistory: [],
        notes: "",
        pastQuestions: "",
      };

      const nextTopics = [...current, topic];
      saveProjectTopics(projectId, nextTopics);
      setTopics(nextTopics);
    },
    [projectId]
  );

  const deleteTopic = useCallback(
    (topicId: string) => {
      const nextTopics = getProjectTopics(projectId).filter(
        (t) => t.id !== topicId
      );
      saveProjectTopics(projectId, nextTopics);

      const nextMaterials = getProjectMaterials(projectId).filter(
        (m) => m.topicId !== topicId
      );
      saveProjectMaterials(projectId, nextMaterials);

      setTopics(nextTopics);
    },
    [projectId]
  );

  // Safe partial update of the existing StudyProject — keeps it as the single
  // source of truth for fields like examDate and targetGrade (Phase 12B).
  const updateProject = useCallback(
    (updates: Partial<Pick<StudyProject, "examDate" | "targetGrade">>) => {
      const current = getProject(projectId);
      if (!current) return;
      const next: StudyProject = { ...current, ...updates };
      saveProject(next);
      setProject(next);
    },
    [projectId]
  );

  const updateTopic = useCallback(
    (topicId: string, updates: Partial<Topic>) => {
      const current = getProjectTopics(projectId);
      const index = current.findIndex((t) => t.id === topicId);
      if (index === -1) return;

      const nextTopics = [...current];
      nextTopics[index] = { ...nextTopics[index], ...updates };
      saveProjectTopics(projectId, nextTopics);
      setTopics(nextTopics);
    },
    [projectId]
  );

  return {
    project,
    topics,
    isLoaded,
    addTopic,
    deleteTopic,
    updateTopic,
    updateProject,
    refreshProject,
  };
}
