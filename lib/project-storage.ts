import type {
  Chat,
  LearningProfile,
  Material,
  Mistake,
  StudyProject,
  Topic,
} from "./types";

const PROJECTS_KEY = "sc_projects";

function projectTopicsKey(projectId: string): string {
  return `sc_topics_${projectId}`;
}

function projectMaterialsKey(projectId: string): string {
  return `sc_materials_${projectId}`;
}

function projectChatKey(projectId: string): string {
  return `sc_chat_${projectId}`;
}

function projectMistakesKey(projectId: string): string {
  return `sc_mistakes_${projectId}`;
}

function projectProfileKey(projectId: string): string {
  return `sc_profile_${projectId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Swallow quota / serialization errors; callers cannot recover on SSR.
  }
}

function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore removal failures.
  }
}

// ─── Projects ────────────────────────────────────────────────────────────────

export function getProjects(): StudyProject[] {
  const raw = readJson<unknown>(PROJECTS_KEY, []);
  return Array.isArray(raw) ? (raw as StudyProject[]) : [];
}

export function saveProjects(projects: StudyProject[]): void {
  writeJson(PROJECTS_KEY, projects);
}

export function saveProject(project: StudyProject): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  saveProjects(projects);
}

export function getProject(projectId: string): StudyProject | null {
  return getProjects().find((p) => p.id === projectId) ?? null;
}

export function deleteProject(projectId: string): void {
  saveProjects(getProjects().filter((p) => p.id !== projectId));
  clearProjectData(projectId);
}

// ─── Project topics ──────────────────────────────────────────────────────────

export function getProjectTopics(projectId: string): Topic[] {
  const raw = readJson<unknown>(projectTopicsKey(projectId), []);
  return Array.isArray(raw) ? (raw as Topic[]) : [];
}

export function saveProjectTopics(projectId: string, topics: Topic[]): void {
  writeJson(projectTopicsKey(projectId), topics);
}

// ─── Project materials ───────────────────────────────────────────────────────

export function getProjectMaterials(projectId: string): Material[] {
  const raw = readJson<unknown>(projectMaterialsKey(projectId), []);
  return Array.isArray(raw) ? (raw as Material[]) : [];
}

export function saveProjectMaterials(
  projectId: string,
  materials: Material[]
): void {
  writeJson(projectMaterialsKey(projectId), materials);
}

export function saveMaterial(material: Material): void {
  const materials = getProjectMaterials(material.projectId);
  const index = materials.findIndex((m) => m.id === material.id);
  if (index >= 0) {
    materials[index] = material;
  } else {
    materials.push(material);
  }
  saveProjectMaterials(material.projectId, materials);
}

export function deleteMaterial(projectId: string, materialId: string): void {
  saveProjectMaterials(
    projectId,
    getProjectMaterials(projectId).filter((m) => m.id !== materialId)
  );
}

// ─── Project chat ────────────────────────────────────────────────────────────

export function getProjectChat(projectId: string): Chat | null {
  return readJson<Chat | null>(projectChatKey(projectId), null);
}

export function saveProjectChat(projectId: string, chat: Chat): void {
  writeJson(projectChatKey(projectId), chat);
}

// ─── Project mistakes ────────────────────────────────────────────────────────

export function getProjectMistakes(projectId: string): Mistake[] {
  const raw = readJson<unknown>(projectMistakesKey(projectId), []);
  return Array.isArray(raw) ? (raw as Mistake[]) : [];
}

export function saveProjectMistakes(
  projectId: string,
  mistakes: Mistake[]
): void {
  writeJson(projectMistakesKey(projectId), mistakes);
}

export function saveProjectMistake(projectId: string, mistake: Mistake): void {
  const mistakes = getProjectMistakes(projectId);
  mistakes.push(mistake);
  saveProjectMistakes(projectId, mistakes);
}

// ─── Project learning profile ───────────────────────────────────────────────

export function getProjectProfile(projectId: string): LearningProfile | null {
  return readJson<LearningProfile | null>(
    projectProfileKey(projectId),
    null
  );
}

export function saveProjectProfile(
  projectId: string,
  profile: LearningProfile
): void {
  writeJson(projectProfileKey(projectId), profile);
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

export function clearProjectData(projectId: string): void {
  removeItem(projectTopicsKey(projectId));
  removeItem(projectMaterialsKey(projectId));
  removeItem(projectChatKey(projectId));
  removeItem(projectMistakesKey(projectId));
  removeItem(projectProfileKey(projectId));
}
