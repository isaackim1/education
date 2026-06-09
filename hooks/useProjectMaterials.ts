"use client";

import { useCallback, useEffect, useState } from "react";
import type { Material } from "@/lib/types";
import {
  deleteMaterial as deleteMaterialStorage,
  getProjectMaterials,
  saveMaterial,
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

export type SaveTopicMaterialInput = {
  topicId: string;
  title: string;
  content: string;
  source?: "paste" | "file";
  fileName?: string;
  fileType?: string;
};

export function useProjectMaterials(projectId: string) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshMaterials = useCallback(() => {
    setMaterials(getProjectMaterials(projectId));
  }, [projectId]);

  useEffect(() => {
    refreshMaterials();
    setIsLoaded(true);
  }, [refreshMaterials]);

  const getMaterialsForTopic = useCallback(
    (topicId: string): Material | null => {
      return (
        getProjectMaterials(projectId).find((m) => m.topicId === topicId) ??
        null
      );
    },
    [projectId]
  );

  const saveTopicMaterial = useCallback(
    (input: SaveTopicMaterialInput) => {
      const existing = getProjectMaterials(projectId).find(
        (m) => m.topicId === input.topicId
      );

      const source = input.source ?? (existing?.source ?? "paste");
      const isFileSource = source === "file";

      const material: Material = existing
        ? {
            ...existing,
            title: input.title.trim(),
            content: input.content,
            source,
            fileName: isFileSource
              ? input.fileName ?? existing.fileName
              : undefined,
            fileType: isFileSource
              ? input.fileType ?? existing.fileType
              : undefined,
          }
        : {
            id: generateId(),
            projectId,
            topicId: input.topicId,
            title: input.title.trim(),
            content: input.content,
            aiSummary: null,
            analyzedAt: null,
            createdAt: new Date().toISOString(),
            source,
            fileName: isFileSource ? input.fileName : undefined,
            fileType: isFileSource ? input.fileType : undefined,
          };

      saveMaterial(material);
      refreshMaterials();
    },
    [projectId, refreshMaterials]
  );

  const deleteMaterial = useCallback(
    (materialId: string) => {
      deleteMaterialStorage(projectId, materialId);
      refreshMaterials();
    },
    [projectId, refreshMaterials]
  );

  return {
    materials,
    isLoaded,
    getMaterialsForTopic,
    saveTopicMaterial,
    deleteMaterial,
    refreshMaterials,
  };
}
