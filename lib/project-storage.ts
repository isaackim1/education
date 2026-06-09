import type {
  Chat,
  ChatMessage,
  LearningProfile,
  Material,
  Mistake,
  MistakeCategory,
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

function writeJson<T>(key: string, value: T): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Swallow quota / serialization errors; callers cannot recover on SSR.
    return false;
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
): boolean {
  return writeJson(projectMistakesKey(projectId), mistakes);
}

export function saveProjectMistake(
  projectId: string,
  mistake: Mistake
): boolean {
  const mistakes = getProjectMistakes(projectId);
  mistakes.push(mistake);
  return saveProjectMistakes(projectId, mistakes);
}

export function updateProjectMistake(
  projectId: string,
  mistakeId: string,
  patch: Partial<Mistake>
): boolean {
  const mistakes = getProjectMistakes(projectId);
  const index = mistakes.findIndex((mistake) => mistake.id === mistakeId);
  if (index < 0) return false;
  mistakes[index] = { ...mistakes[index], ...patch };
  return saveProjectMistakes(projectId, mistakes);
}

export function markProjectMistakeReviewed(
  projectId: string,
  mistakeId: string
): boolean {
  const current = getProjectMistakes(projectId).find(
    (mistake) => mistake.id === mistakeId
  );
  if (!current) return false;
  if (current.reviewed) return true;
  return updateProjectMistake(projectId, mistakeId, {
    reviewed: true,
    reviewCount: current.reviewCount + 1,
    lastReviewed: new Date().toISOString(),
  });
}

export function resetProjectMistakeReview(
  projectId: string,
  mistakeId: string
): boolean {
  return updateProjectMistake(projectId, mistakeId, { reviewed: false });
}

function generateMistakeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

function isMistakeCategory(value: string): value is MistakeCategory {
  return (
    value === "conceptual" ||
    value === "calculation" ||
    value === "recall" ||
    value === "application"
  );
}

export function resolveProjectMistakeTopic(
  topics: Topic[],
  activeTopicName: string | null
): { topicId: string; topicName: string } {
  if (activeTopicName) {
    const match = topics.find((topic) => topic.name === activeTopicName);
    if (match) {
      return { topicId: match.id, topicName: match.name };
    }
    return { topicId: "general", topicName: activeTopicName };
  }

  if (topics.length === 1) {
    return { topicId: topics[0].id, topicName: topics[0].name };
  }

  return { topicId: "general", topicName: "General" };
}

function findPreviousAgentQuestion(messages: ChatMessage[]): string {
  for (let i = messages.length - 2; i >= 0; i--) {
    if (messages[i].role === "agent") {
      return messages[i].content;
    }
  }
  return "Training question";
}

export type CreateProjectMistakeInput = {
  projectId: string;
  studentAnswer: string;
  agentReply: string;
  mistakeCategory: string;
  topics: Topic[];
  activeTopicName: string | null;
  messagesBeforeAgent: ChatMessage[];
};

export function createProjectMistakeFromChat(
  input: CreateProjectMistakeInput
): Mistake {
  const { topicId, topicName } = resolveProjectMistakeTopic(
    input.topics,
    input.activeTopicName
  );
  const category = isMistakeCategory(input.mistakeCategory)
    ? input.mistakeCategory
    : "conceptual";

  return {
    id: generateMistakeId(),
    examId: input.projectId,
    projectId: input.projectId,
    topicId,
    topicName,
    question: findPreviousAgentQuestion(input.messagesBeforeAgent),
    studentAnswer: input.studentAnswer,
    correctApproach: input.agentReply,
    mistakeCategory: category,
    agentNote: "Ivvy flagged this during project chat.",
    rememberThis: "",
    followUpQuestion: "",
    reviewed: false,
    reviewCount: 0,
    lastReviewed: null,
    nextReviewDate: null,
    createdAt: new Date().toISOString(),
  };
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
