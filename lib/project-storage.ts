import type {
  Chat,
  ChatMessage,
  ConfidenceLevel,
  LearningProfile,
  Material,
  Mistake,
  MistakeCategory,
  ProjectGoals,
  RetrievalAttempt,
  ReviewRating,
  StudyProject,
  Topic,
  TrainingSession,
} from "./types";
import {
  gradeSchedule,
  isScheduleDue,
  isValidSchedule,
  newSchedule,
} from "./scheduling";
import { normalizeRetrievalAttempt } from "./calibration";
import { addDaysToDate, getTodayIsoDate } from "./utils";

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

function projectGoalsKey(projectId: string): string {
  return `sc_goals_${projectId}`;
}

function trainingLogKey(projectId: string): string {
  return `sc_training_log_${projectId}`;
}

function retrievalAttemptsKey(projectId: string): string {
  return `sc_attempts_${projectId}`;
}

const MAX_WEEKLY_SESSION_GOAL = 50;
const MAX_WEEKLY_REVIEW_GOAL = 200;
const MAX_SESSION_DURATION_MINUTES = 600;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampFiniteInteger(value: unknown, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.floor(value)));
}

function isConfidence(value: unknown): value is 1 | 2 | 3 | 4 | 5 {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function isValidTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !Number.isNaN(new Date(value).getTime())
  );
}

function normalizeProjectGoals(
  value: unknown,
  projectId: string
): ProjectGoals | null {
  if (!isRecord(value) || value.projectId !== projectId) return null;
  if (
    typeof value.weeklySessionGoal !== "number" ||
    !Number.isFinite(value.weeklySessionGoal) ||
    typeof value.weeklyReviewGoal !== "number" ||
    !Number.isFinite(value.weeklyReviewGoal)
  ) {
    return null;
  }

  const focusTopicIds =
    Array.isArray(value.focusTopicIds) &&
    value.focusTopicIds.every((topicId) => typeof topicId === "string")
      ? Array.from(new Set(value.focusTopicIds))
      : [];

  return {
    projectId,
    weeklySessionGoal: clampFiniteInteger(
      value.weeklySessionGoal,
      MAX_WEEKLY_SESSION_GOAL
    ),
    weeklyReviewGoal: clampFiniteInteger(
      value.weeklyReviewGoal,
      MAX_WEEKLY_REVIEW_GOAL
    ),
    focusTopicIds,
    currentConfidence: isConfidence(value.currentConfidence)
      ? value.currentConfidence
      : 3,
    updatedAt: isValidTimestamp(value.updatedAt)
      ? value.updatedAt
      : new Date().toISOString(),
  };
}

function normalizeTrainingSession(
  value: unknown,
  projectId: string
): TrainingSession | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    value.id.trim().length === 0 ||
    value.projectId !== projectId ||
    !isValidTimestamp(value.loggedAt)
  ) {
    return null;
  }

  if (
    value.type !== "studied-materials" &&
    value.type !== "trained-chat" &&
    value.type !== "reviewed-mistakes" &&
    value.type !== "other"
  ) {
    return null;
  }

  return {
    id: value.id,
    projectId,
    type: value.type,
    topicId: typeof value.topicId === "string" ? value.topicId : null,
    durationMinutes: clampFiniteInteger(
      value.durationMinutes,
      MAX_SESSION_DURATION_MINUTES
    ),
    note: typeof value.note === "string" ? value.note : "",
    confidenceAfter: isConfidence(value.confidenceAfter)
      ? value.confidenceAfter
      : null,
    loggedAt: value.loggedAt,
  };
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

/** Seed the old fixed-interval reviews into an FSRS stability estimate. */
function legacyStability(reviewCount: number): number {
  if (reviewCount <= 1) return 2;
  if (reviewCount === 2) return 5;
  return 10;
}

function validDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Lazily attach an FSRS schedule to mistakes saved before the scheduler
 * existed. Never-reviewed mistakes become due-now "new" cards; already-reviewed
 * ones keep their intended next date so prior review work isn't discarded.
 */
function ensureSchedule(mistake: Mistake): Mistake {
  if (isValidSchedule(mistake.schedule)) return mistake;
  const today = getTodayIsoDate();
  if (!mistake.reviewed || mistake.reviewCount <= 0) {
    return { ...mistake, schedule: newSchedule(today) };
  }
  const stability = legacyStability(mistake.reviewCount);
  const due =
    validDateOnly(mistake.nextReviewDate) ??
    addDaysToDate(today, Math.round(stability));
  return {
    ...mistake,
    schedule: {
      stability,
      difficulty: 5,
      due,
      lastReview: validDateOnly(mistake.lastReviewed) ?? today,
      state: "review",
      reps: mistake.reviewCount,
      lapses: 0,
    },
  };
}

export function getProjectMistakes(projectId: string): Mistake[] {
  const raw = readJson<unknown>(projectMistakesKey(projectId), []);
  if (!Array.isArray(raw)) return [];
  return (raw as Mistake[]).map(ensureSchedule);
}

/** Mistakes whose next review date has arrived (or that were never reviewed). */
export function getDueProjectMistakes(
  projectId: string,
  today: string = getTodayIsoDate()
): Mistake[] {
  return getProjectMistakes(projectId).filter((mistake) =>
    isScheduleDue(mistake.schedule, today)
  );
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

/**
 * Grade a review and reschedule the mistake. Keeps the legacy reviewed/count/
 * date fields in sync so older UI keeps working while queues run off `schedule`.
 *
 * When the student tapped a pre-answer `confidence`, this also records a
 * RetrievalAttempt for the calibration score, and closes the loop (PLAN Step 5):
 * a confidently-wrong answer — the most dangerous gap — is pulled straight back
 * to today so it resurfaces in the very next session.
 */
export function gradeProjectMistake(
  projectId: string,
  mistakeId: string,
  rating: ReviewRating,
  confidence?: ConfidenceLevel
): boolean {
  const current = getProjectMistakes(projectId).find(
    (mistake) => mistake.id === mistakeId
  );
  if (!current) return false;
  const today = getTodayIsoDate();
  const graded = gradeSchedule(
    current.schedule ?? newSchedule(today),
    rating,
    today
  );

  const wasCorrect = rating !== "again";
  const overconfidentMiss = confidence === 3 && !wasCorrect;
  const schedule = overconfidentMiss
    ? { ...graded, due: today, state: "relearning" as const }
    : graded;

  if (confidence !== undefined) {
    recordRetrievalAttempt(projectId, {
      mistakeId,
      topicId: current.topicId || null,
      predictedConfidence: confidence,
      wasCorrect,
      timestamp: new Date().toISOString(),
    });
  }

  return updateProjectMistake(projectId, mistakeId, {
    schedule,
    reviewed: true,
    reviewCount: schedule.reps,
    lastReviewed: new Date().toISOString(),
    nextReviewDate: overconfidentMiss ? today : schedule.due,
  });
}

/** Back-compat shim: a plain "reviewed" tap counts as a successful recall. */
export function markProjectMistakeReviewed(
  projectId: string,
  mistakeId: string
): boolean {
  return gradeProjectMistake(projectId, mistakeId, "good");
}

/** Bring a mistake back into the due queue immediately. */
export function resetProjectMistakeReview(
  projectId: string,
  mistakeId: string
): boolean {
  const current = getProjectMistakes(projectId).find(
    (mistake) => mistake.id === mistakeId
  );
  if (!current) return false;
  const today = getTodayIsoDate();
  const base = current.schedule ?? newSchedule(today);
  return updateProjectMistake(projectId, mistakeId, {
    reviewed: false,
    nextReviewDate: today,
    schedule: { ...base, due: today, state: "relearning" },
  });
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

  return { topicId: "general", topicName: "General" };
}

const MAX_CORRECT_APPROACH_CHARS = 400;

function truncateCorrectApproach(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_CORRECT_APPROACH_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_CORRECT_APPROACH_CHARS)}...`;
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
    correctApproach: truncateCorrectApproach(input.agentReply),
    mistakeCategory: category,
    agentNote: `Flagged as a ${category} mistake during training.`,
    rememberThis: "",
    followUpQuestion: "",
    reviewed: false,
    reviewCount: 0,
    lastReviewed: null,
    nextReviewDate: getTodayIsoDate(),
    schedule: newSchedule(getTodayIsoDate()),
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

// ─── Project goals (Phase 12B) ───────────────────────────────────────────────

export function getProjectGoals(projectId: string): ProjectGoals | null {
  return normalizeProjectGoals(
    readJson<unknown>(projectGoalsKey(projectId), null),
    projectId
  );
}

export function saveProjectGoals(
  projectId: string,
  goals: ProjectGoals
): boolean {
  return writeJson(projectGoalsKey(projectId), goals);
}

// ─── Training log (Phase 12B) ────────────────────────────────────────────────

export function getTrainingLog(projectId: string): TrainingSession[] {
  const raw = readJson<unknown>(trainingLogKey(projectId), []);
  if (!Array.isArray(raw)) return [];

  return raw
    .map((session) => normalizeTrainingSession(session, projectId))
    .filter((session): session is TrainingSession => session !== null);
}

function saveTrainingLog(
  projectId: string,
  sessions: TrainingSession[]
): boolean {
  return writeJson(trainingLogKey(projectId), sessions);
}

export function addTrainingSession(
  projectId: string,
  session: TrainingSession
): boolean {
  const sessions = getTrainingLog(projectId);
  sessions.push(session);
  return saveTrainingLog(projectId, sessions);
}

export function deleteTrainingSession(
  projectId: string,
  sessionId: string
): boolean {
  return saveTrainingLog(
    projectId,
    getTrainingLog(projectId).filter((session) => session.id !== sessionId)
  );
}

// ─── Retrieval attempts (calibration) ────────────────────────────────────────

// Calibration only needs recent history; cap storage so a heavy reviewer never
// blows the localStorage quota.
const MAX_RETRIEVAL_ATTEMPTS = 500;

export function getRetrievalAttempts(projectId: string): RetrievalAttempt[] {
  const raw = readJson<unknown>(retrievalAttemptsKey(projectId), []);
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeRetrievalAttempt)
    .filter((attempt): attempt is RetrievalAttempt => attempt !== null);
}

export function recordRetrievalAttempt(
  projectId: string,
  attempt: RetrievalAttempt
): boolean {
  const attempts = getRetrievalAttempts(projectId);
  attempts.push(attempt);
  const trimmed =
    attempts.length > MAX_RETRIEVAL_ATTEMPTS
      ? attempts.slice(attempts.length - MAX_RETRIEVAL_ATTEMPTS)
      : attempts;
  return writeJson(retrievalAttemptsKey(projectId), trimmed);
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

export function clearProjectData(projectId: string): void {
  removeItem(projectTopicsKey(projectId));
  removeItem(projectMaterialsKey(projectId));
  removeItem(projectChatKey(projectId));
  removeItem(projectMistakesKey(projectId));
  removeItem(projectProfileKey(projectId));
  removeItem(projectGoalsKey(projectId));
  removeItem(trainingLogKey(projectId));
  removeItem(retrievalAttemptsKey(projectId));
}
