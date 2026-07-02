export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type SessionMode = "learn" | "quiz" | "solve" | "review" | "exam";

export type SessionType = "learn" | "quiz" | "review" | "exam-sim";

export type MistakeCategory =
  | "conceptual"
  | "calculation"
  | "recall"
  | "application";

export type QuestionType =
  | "active-recall"
  | "exam-style"
  | "calculation"
  | "concept";

// ─── Spaced repetition (FSRS) ────────────────────────────────────────────────

/** How well a mistake was recalled on review. Drives the scheduler. */
export type ReviewRating = "again" | "hard" | "good" | "easy";

export type ScheduleState = "new" | "learning" | "review" | "relearning";

/** Pre-answer confidence a student taps before feedback: guessing → certain. */
export type ConfidenceLevel = 1 | 2 | 3;

/**
 * One graded retrieval where the student predicted their confidence before
 * seeing feedback. The gap between `predictedConfidence` and `wasCorrect` is the
 * calibration signal (illusion of competence / Dunning-Kruger). `wasCorrect`
 * comes free from the FSRS grade: "again" ⇒ wrong, any other rating ⇒ right.
 */
export interface RetrievalAttempt {
  mistakeId: string;
  topicId: string | null;
  predictedConfidence: ConfidenceLevel;
  wasCorrect: boolean;
  timestamp: string;
}

/**
 * Per-mistake memory state for the in-house FSRS scheduler. `stability` is the
 * number of days until recall probability drops to the desired retention;
 * `difficulty` is 1–10. `due` is a local YYYY-MM-DD date.
 */
export interface MistakeSchedule {
  stability: number;
  difficulty: number;
  due: string;
  lastReview: string | null;
  state: ScheduleState;
  reps: number;
  lapses: number;
}

export interface Exam {
  id: string;
  subject: string;
  examDate: string;
  studyHoursPerDay: number;
  confidenceLevel: 1 | 2 | 3 | 4 | 5;
  topicNames: string[];
  notes: string;
  pastQuestions: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  examId: string;
  name: string;
  masteryScore: MasteryLevel;
  isWeakTopic: boolean;
  mistakeCount: number;
  lastStudied: string | null;
  masteryHistory: { date: string; score: MasteryLevel }[];
  notes: string;
  pastQuestions: string;
}

export interface StudyPlan {
  id: string;
  examId: string;
  days: DailyPlan[];
  generatedAt: string;
}

export interface DailyPlan {
  day: number;
  date: string;
  topicIds: string[];
  sessionType: SessionType;
  goalDescription: string;
  estimatedMinutes: number;
  completed: boolean;
  sessionId: string | null;
}

export interface StudySession {
  id: string;
  examId: string;
  day: number;
  date: string;
  topicIds: string[];
  mode: SessionMode;
  messages: Message[];
  startedAt: string;
  endedAt: string | null;
  summary: SessionSummary | null;
}

export interface Message {
  id: string;
  role: "agent" | "student";
  content: string;
  mode: SessionMode;
  flaggedMistake: boolean;
  timestamp: string;
}

export interface SessionSummary {
  topicsCovered: string[];
  masteryChanges: {
    topicId: string;
    before: MasteryLevel;
    after: MasteryLevel;
  }[];
  newMistakeCount: number;
  mistakesReviewed: number;
  tomorrowFocus: string;
  tomorrowSessionType: SessionType;
}

export interface Question {
  id: string;
  topicId: string;
  examId: string;
  text: string;
  type: QuestionType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  correctAnswer: string;
  hint: string | null;
  source: "generated" | "past-exam";
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  sessionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  isPartial: boolean;
  agentFeedback: string;
  mistakeCategory: MistakeCategory | null;
  timestamp: string;
}

export interface Mistake {
  id: string;
  examId: string;
  projectId?: string;
  topicId: string;
  topicName: string;
  question: string;
  studentAnswer: string;
  correctApproach: string;
  mistakeCategory: MistakeCategory;
  agentNote: string;
  rememberThis: string;
  followUpQuestion: string;
  reviewed: boolean;
  reviewCount: number;
  lastReviewed: string | null;
  nextReviewDate: string | null;
  /** FSRS memory state. Optional for back-compat; initialized lazily on read. */
  schedule?: MistakeSchedule;
  createdAt: string;
}

// ─── Project-based types (Phase 1) ───────────────────────────────────────────

export interface StudyProject {
  id: string;
  name: string;
  subject: string;
  examDate: string;
  targetGrade: string;
  createdAt: string;
  lastStudiedAt: string | null;
}

export interface Material {
  id: string;
  projectId: string;
  topicId: string;
  title: string;
  content: string;
  aiSummary: string | null;
  analyzedAt: string | null;
  createdAt: string;
  source?: "paste" | "file";
  fileName?: string;
  fileType?: string;
}

export type PreferredStudyMode =
  | "quiz-first"
  | "explanation-first"
  | "example-first";

export interface LearningProfile {
  projectId: string;
  preferredMode: PreferredStudyMode;
  studyHoursPerDay: number;
  confidenceLevel: 1 | 2 | 3 | 4 | 5;
  rawAnswers: { question: string; answer: string }[];
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "agent" | "student";
  content: string;
  flaggedMistake: boolean;
  timestamp: string;
  mistakeSaved?: boolean;
}

export interface Chat {
  id: string;
  projectId: string;
  messages: ChatMessage[];
  createdAt: string;
  lastMessageAt: string | null;
}

// ─── Goals + training log (Phase 12B) ────────────────────────────────────────
// Note: examDate and targetGrade live on StudyProject and remain the single
// source of truth — they are intentionally NOT duplicated here.

export interface ProjectGoals {
  projectId: string;
  weeklySessionGoal: number;
  weeklyReviewGoal: number;
  focusTopicIds: string[];
  currentConfidence: 1 | 2 | 3 | 4 | 5;
  updatedAt: string;
}

export type TrainingSessionType =
  | "studied-materials"
  | "trained-chat"
  | "reviewed-mistakes"
  | "other";

export interface TrainingSession {
  id: string;
  projectId: string;
  type: TrainingSessionType;
  topicId: string | null;
  durationMinutes: number;
  note: string;
  confidenceAfter: 1 | 2 | 3 | 4 | 5 | null;
  loggedAt: string;
}
