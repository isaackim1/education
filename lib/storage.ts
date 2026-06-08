import type {
  Exam,
  Mistake,
  StudyPlan,
  StudySession,
  Topic,
} from "./types";

type StoredTopic = Omit<Topic, "notes" | "pastQuestions"> &
  Partial<Pick<Topic, "notes" | "pastQuestions">>;

const KEYS = {
  exam: "studycoach_exam",
  plan: "studycoach_plan",
  topics: "studycoach_topics",
  sessions: "studycoach_sessions",
  mistakes: "studycoach_mistakes",
} as const;

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
    return false;
  }
}

function removeItem(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getExam(): Exam | null {
  return readJson<Exam | null>(KEYS.exam, null);
}

export function saveExam(exam: Exam): boolean {
  return writeJson(KEYS.exam, exam);
}

export function clearExam(): void {
  removeItem(KEYS.exam);
}

export function getStudyPlan(): StudyPlan | null {
  return readJson<StudyPlan | null>(KEYS.plan, null);
}

export function saveStudyPlan(plan: StudyPlan): boolean {
  return writeJson(KEYS.plan, plan);
}

export function getTopics(): Topic[] {
  const raw = readJson<unknown>(KEYS.topics, []);
  if (!Array.isArray(raw) || !raw.every(isStoredTopic)) return [];

  // Migrate legacy localStorage topics created before per-topic materials existed.
  return raw.map((t) => ({
    ...t,
    notes: typeof t.notes === "string" ? t.notes : "",
    pastQuestions:
      typeof t.pastQuestions === "string" ? t.pastQuestions : "",
  }));
}

function isStoredTopic(value: unknown): value is StoredTopic {
  if (typeof value !== "object" || value === null) return false;

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "examId" in value &&
    typeof value.examId === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "masteryScore" in value &&
    typeof value.masteryScore === "number" &&
    Number.isInteger(value.masteryScore) &&
    value.masteryScore >= 0 &&
    value.masteryScore <= 5 &&
    "isWeakTopic" in value &&
    typeof value.isWeakTopic === "boolean" &&
    "mistakeCount" in value &&
    typeof value.mistakeCount === "number" &&
    "lastStudied" in value &&
    (typeof value.lastStudied === "string" || value.lastStudied === null) &&
    "masteryHistory" in value &&
    Array.isArray(value.masteryHistory) &&
    value.masteryHistory.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        "date" in entry &&
        typeof entry.date === "string" &&
        "score" in entry &&
        typeof entry.score === "number" &&
        Number.isInteger(entry.score) &&
        entry.score >= 0 &&
        entry.score <= 5
    ) &&
    (!("notes" in value) ||
      value.notes === undefined ||
      typeof value.notes === "string") &&
    (!("pastQuestions" in value) ||
      value.pastQuestions === undefined ||
      typeof value.pastQuestions === "string")
  );
}

export function saveTopics(topics: Topic[]): boolean {
  return writeJson(KEYS.topics, topics);
}

export function updateTopic(topicId: string, updates: Partial<Topic>): void {
  const topics = getTopics();
  const index = topics.findIndex((t) => t.id === topicId);
  if (index === -1) return;
  topics[index] = { ...topics[index], ...updates };
  saveTopics(topics);
}

export function getSessions(): StudySession[] {
  return readJson<StudySession[]>(KEYS.sessions, []);
}

export function saveSession(session: StudySession): boolean {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  return writeJson(KEYS.sessions, sessions);
}

export function updateSession(
  sessionId: string,
  updates: Partial<StudySession>
): boolean {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return false;
  sessions[index] = { ...sessions[index], ...updates };
  return writeJson(KEYS.sessions, sessions);
}

export function getMistakes(): Mistake[] {
  return readJson<Mistake[]>(KEYS.mistakes, []);
}

export function saveMistake(mistake: Mistake): void {
  const mistakes = getMistakes();
  mistakes.push(mistake);
  writeJson(KEYS.mistakes, mistakes);
}

export function updateMistake(
  mistakeId: string,
  updates: Partial<Mistake>
): void {
  const mistakes = getMistakes();
  const index = mistakes.findIndex((m) => m.id === mistakeId);
  if (index === -1) return;
  mistakes[index] = { ...mistakes[index], ...updates };
  writeJson(KEYS.mistakes, mistakes);
}

export function clearAllStudyCoachData(): void {
  Object.values(KEYS).forEach((key) => {
    removeItem(key);
  });
}
