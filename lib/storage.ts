import type {
  Exam,
  Mistake,
  StudyPlan,
  StudySession,
  Topic,
} from "./types";

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

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getExam(): Exam | null {
  return readJson<Exam | null>(KEYS.exam, null);
}

export function saveExam(exam: Exam): void {
  writeJson(KEYS.exam, exam);
}

export function clearExam(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEYS.exam);
}

export function getStudyPlan(): StudyPlan | null {
  return readJson<StudyPlan | null>(KEYS.plan, null);
}

export function saveStudyPlan(plan: StudyPlan): void {
  writeJson(KEYS.plan, plan);
}

export function getTopics(): Topic[] {
  return readJson<Topic[]>(KEYS.topics, []);
}

export function saveTopics(topics: Topic[]): void {
  writeJson(KEYS.topics, topics);
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

export function saveSession(session: StudySession): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  writeJson(KEYS.sessions, sessions);
}

export function updateSession(
  sessionId: string,
  updates: Partial<StudySession>
): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return;
  sessions[index] = { ...sessions[index], ...updates };
  writeJson(KEYS.sessions, sessions);
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
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
}
