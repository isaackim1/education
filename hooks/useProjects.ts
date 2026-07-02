"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudyProject } from "@/lib/types";
import {
  deleteProject as deleteProjectStorage,
  getProjects,
  saveProject,
} from "@/lib/project-storage";

export type CreateProjectInput = {
  name: string;
  subject: string;
  examDate: string;
  targetGrade: string;
};

function generateProjectId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

export function useProjects() {
  const [projects, setProjects] = useState<StudyProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshProjects = useCallback(() => {
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    refreshProjects();
    setIsLoaded(true);
  }, [refreshProjects]);

  const createProject = useCallback(
    (input: CreateProjectInput): StudyProject | null => {
      const project: StudyProject = {
        id: generateProjectId(),
        name: input.name.trim(),
        subject: input.subject.trim(),
        examDate: input.examDate,
        targetGrade: input.targetGrade.trim() || "Pass",
        createdAt: new Date().toISOString(),
        lastStudiedAt: null,
      };
      const saved = saveProject(project);
      if (!saved) return null;
      refreshProjects();
      return project;
    },
    [refreshProjects]
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      deleteProjectStorage(projectId);
      refreshProjects();
    },
    [refreshProjects]
  );

  return {
    projects,
    isLoaded,
    createProject,
    deleteProject,
    refreshProjects,
  };
}
