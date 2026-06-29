/**
 * Unknown Digital University — shared domain types (Phase DU-1A).
 *
 * Ivvy's exam-coach "brains" are re-cast for a founder-focused digital
 * university:
 *   Ivvy Content Brain      → Unknown Knowledge Brain   (curated concepts)
 *   Ivvy Learner Brain      → Founder Journey Brain      (FounderState)
 *   Ivvy Coach Brain        → Unknown AI Mentor          (/api/mentor)
 *   Ivvy Assessment Brain   → Feed-Forward Brain         (/api/feedforward)
 *   Ivvy Course Map         → Digital University Module Map
 *   Ivvy Progress Dashboard → Founder Progress Journey
 *
 * Everything here is storage- and transport-shaped so a future database /
 * vector layer can replace the localStorage backing without touching the UI.
 */

// ── Founder venture ──────────────────────────────────────────────────────────
export type VentureStage = "idea" | "validation" | "building" | "launched";

export interface FounderProfile {
  id: string;
  ventureName: string;
  idea: string;
  stage: VentureStage;
  targetCustomer?: string;
  currentChallenge?: string;
  goals: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Assignment (Venture Studio) ──────────────────────────────────────────────
export interface AssignmentSubmission {
  id: string;
  moduleId: string;
  founderProfileId: string;
  /** Keyed by assignment section id → founder's written answer. */
  sections: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// ── Feed-forward (never a grade) ─────────────────────────────────────────────
export interface FeedForwardReport {
  id: string;
  submissionId: string;
  strengths: string[];
  unclearAreas: string[];
  unsupportedAssumptions: string[];
  conceptConnections: string[];
  mentorQuestions: string[];
  improvementSteps: string[];
  nextAction: string;
  summary: string;
  createdAt: string;
}

/** The payload shape returned by /api/feedforward (no id / timestamps yet). */
export type FeedForwardResult = Omit<
  FeedForwardReport,
  "id" | "submissionId" | "createdAt"
>;

// ── Founder journey state (Learner Brain) ────────────────────────────────────
export type ProgressState =
  | "not_started"
  | "learning_concept"
  | "applying_to_venture"
  | "draft_submitted"
  | "feedforward_received"
  | "revision_needed"
  | "reflection_complete"
  | "ready_for_mentor_review"
  | "module_complete";

export interface FounderState {
  founderProfileId: string;
  currentModuleId: string;
  currentStepId: string;
  progressState: ProgressState;
  strengths: string[];
  risks: string[];
  recurringPatterns: string[];
  nextRecommendedAction?: string;
}

// ── Lesson reflections (Learn flow) ──────────────────────────────────────────
/** Keyed by concept/lesson id → the founder's short applied reflection. */
export type LessonReflections = Record<string, string>;

// ── Knowledge base (Unknown Knowledge Brain) ─────────────────────────────────
/**
 * A single curated concept. Shaped like a retrievable "chunk" so a future RAG /
 * vector layer can drop in: each concept has a stable id, a label-able source,
 * and self-contained prose fields that can be embedded independently.
 */
export interface KnowledgeConcept {
  id: string;
  title: string;
  summary: string;
  unknownStyleInterpretation: string;
  founderApplication: string;
  commonMistakes: string[];
  mentorQuestions: string[];
  sourceLabel: string;
}

// ── Module map (Digital University Module Map) ───────────────────────────────
export interface ModuleStep {
  id: string;
  order: number;
  title: string;
}

export interface ModuleAssignmentSection {
  id: string;
  prompt: string;
  /** Optional helper text shown beneath the prompt in the Studio. */
  helper?: string;
}

export interface ModuleDefinition {
  id: string;
  programId: string;
  title: string;
  tagline: string;
  status: "active" | "locked";
  /** What the founder will learn / what they will build (overview copy). */
  willLearn: string[];
  willBuild: string[];
  steps: ModuleStep[];
  /** Concept ids (into the knowledge base) taught in the Learn flow. */
  conceptIds: string[];
  assignmentTitle: string;
  assignmentSections: ModuleAssignmentSection[];
}

export interface ProgramDefinition {
  id: string;
  title: string;
  tagline: string;
  modules: { id: string; title: string; tagline: string; status: "active" | "locked" }[];
}

// ── Mentor chat (Unknown AI Mentor) ──────────────────────────────────────────
export interface MentorMessage {
  id: string;
  role: "founder" | "mentor";
  content: string;
  createdAt: string;
}

export interface MentorResult {
  reply: string;
  suggestedNextAction?: string;
  suggestedQuestion?: string;
}
