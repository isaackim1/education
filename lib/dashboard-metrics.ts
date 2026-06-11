import type {
  Chat,
  Material,
  Mistake,
  ProjectGoals,
  StudyProject,
  Topic,
  TrainingSession,
} from "./types";

export type ReadinessBand =
  | "Getting set up"
  | "Building coverage"
  | "Actively training"
  | "Review-ready";

export interface ReadinessMetrics {
  score: number;
  displayScore: number;
  band: ReadinessBand;
  components: {
    setup: number;
    materials: number;
    practice: number;
    review: number;
  };
}

export interface ActivityCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3;
}

export type TopicCoverageState =
  | "No materials"
  | "Has materials"
  | "Practiced"
  | "Reviewed";

export interface TopicCoverageRow {
  topicId: string;
  name: string;
  state: TopicCoverageState;
  progressPercent: number;
  mistakeCount: number;
  unreviewedCount: number;
  reviewedCount: number;
  hasMaterials: boolean;
  isWeakArea: boolean;
}

export interface TodaysPlanAction {
  title: string;
  description: string;
  href: string;
  kind: "setup" | "materials" | "training" | "review";
}

export interface TodaysPlanMetrics {
  primary: TodaysPlanAction;
  secondary: TodaysPlanAction[];
}

export interface WeeklyProgressMetrics {
  sessionsDone: number;
  sessionGoal: number;
  sessionPercent: number;
  reviewsDone: number;
  reviewGoal: number;
  reviewPercent: number;
  sessionsMet: boolean;
  reviewsMet: boolean;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    const date = new Date(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function localDateKey(value?: string | null): string | null {
  const date = parseDate(value);
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hasMeaningfulMaterial(material: Material): boolean {
  return material.content.trim().length > 0;
}

function materialTopicIds(materials: Material[]): Set<string> {
  return new Set(
    materials.filter(hasMeaningfulMaterial).map((material) => material.topicId)
  );
}

export function daysUntil(examDate?: string): number | null {
  const exam = parseDate(examDate);
  if (!exam) return null;

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const examUtc = Date.UTC(exam.getFullYear(), exam.getMonth(), exam.getDate());
  const difference = examUtc - todayUtc;
  if (difference <= 0) return 0;
  return Math.ceil(difference / 86_400_000);
}

/** Local Monday 00:00 of the current week. */
function startOfCurrentWeek(): Date {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // getDay(): 0 = Sunday … 6 = Saturday. Shift so Monday is the first day.
  const dayFromMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayFromMonday);
  return date;
}

function isInCurrentWeek(
  value?: string | null,
  weekStart?: Date,
  now = new Date()
): boolean {
  const date = parseDate(value);
  if (!date) return false;
  const start = weekStart ?? startOfCurrentWeek();
  return date.getTime() >= start.getTime() && date.getTime() <= now.getTime();
}

function safeNonNegativeInteger(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/**
 * Weekly goal progress. Sessions come from the manual training log; reviews are
 * derived from existing mistake review timestamps. Returns null when no goals
 * are set so callers can fall back to pre-12B behavior.
 */
export function computeWeeklyProgress(
  goals: ProjectGoals | null,
  sessions: TrainingSession[],
  mistakes: Mistake[]
): WeeklyProgressMetrics | null {
  if (!goals) return null;

  const weekStart = startOfCurrentWeek();
  const now = new Date();
  const sessionGoal = safeNonNegativeInteger(goals.weeklySessionGoal);
  const reviewGoal = safeNonNegativeInteger(goals.weeklyReviewGoal);

  const sessionsDone = sessions.filter((session) =>
    isInCurrentWeek(session.loggedAt, weekStart, now)
  ).length;
  const reviewsDone = mistakes.filter((mistake) =>
    isInCurrentWeek(mistake.lastReviewed, weekStart, now)
  ).length;

  const sessionPercent =
    sessionGoal === 0
      ? 100
      : Math.min(100, Math.round((sessionsDone / sessionGoal) * 100));
  const reviewPercent =
    reviewGoal === 0
      ? 100
      : Math.min(100, Math.round((reviewsDone / reviewGoal) * 100));

  return {
    sessionsDone,
    sessionGoal,
    sessionPercent,
    reviewsDone,
    reviewGoal,
    reviewPercent,
    sessionsMet: sessionGoal === 0 || sessionsDone >= sessionGoal,
    reviewsMet: reviewGoal === 0 || reviewsDone >= reviewGoal,
  };
}

export function computeReadiness(
  topics: Topic[],
  materials: Material[],
  mistakes: Mistake[]
): ReadinessMetrics {
  const topicsCount = topics.length;
  const topicsWithMaterial = new Set(
    materials
      .filter(hasMeaningfulMaterial)
      .map((material) => material.topicId)
      .filter((topicId) => topics.some((topic) => topic.id === topicId))
  ).size;
  const totalMistakes = mistakes.length;
  const reviewedMistakes = mistakes.filter((mistake) => mistake.reviewed).length;

  const components = {
    setup: clamp(topicsCount / 5),
    materials: clamp(topicsWithMaterial / Math.max(1, topicsCount)),
    practice: totalMistakes === 0 ? 0 : clamp(totalMistakes / 10),
    review:
      totalMistakes === 0
        ? 0
        : clamp(reviewedMistakes / Math.max(1, totalMistakes)),
  };

  const score = Math.round(
    clamp(
      components.setup * 0.2 +
        components.materials * 0.25 +
        components.practice * 0.25 +
        components.review * 0.3
    ) * 100
  );
  const displayScore = Math.min(100, Math.round(score / 5) * 5);

  const band: ReadinessBand =
    score < 25
      ? "Getting set up"
      : score < 50
        ? "Building coverage"
        : score < 75
          ? "Actively training"
          : "Review-ready";

  return { score, displayScore, band, components };
}

export function computeActivity(
  chat: Chat | null,
  mistakes: Mistake[],
  days = 84,
  sessions: TrainingSession[] = []
): ActivityCell[] {
  const safeDays = Math.max(1, Math.floor(Number.isFinite(days) ? days : 84));
  const counts = new Map<string, number>();

  function increment(timestamp?: string | null) {
    const key = localDateKey(timestamp);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const message of chat?.messages ?? []) {
    if (message && message.role === "student") {
      increment(message.timestamp);
    }
  }

  for (const mistake of mistakes) {
    increment(mistake.createdAt);
    increment(mistake.lastReviewed);
  }

  for (const session of sessions) {
    increment(session.loggedAt);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: ActivityCell[] = [];

  for (let offset = safeDays - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const key = `${year}-${month}-${day}`;
    const count = counts.get(key) ?? 0;
    const level: ActivityCell["level"] =
      count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
    cells.push({ date: key, count, level });
  }

  return cells;
}

export function computeTopicCoverage(
  topics: Topic[],
  materials: Material[],
  mistakes: Mistake[]
): TopicCoverageRow[] {
  const materialIds = materialTopicIds(materials);
  const topicIds = new Set(topics.map((topic) => topic.id));

  function rowForTopic(topic: Topic): TopicCoverageRow {
    const topicMistakes = mistakes.filter(
      (mistake) => mistake.topicId === topic.id
    );
    return buildCoverageRow(
      topic.id,
      topic.name,
      materialIds.has(topic.id),
      topicMistakes,
      false
    );
  }

  const rows = topics.map(rowForTopic);
  const unassignedMistakes = mistakes.filter(
    (mistake) =>
      !mistake.topicId ||
      mistake.topicId === "general" ||
      !topicIds.has(mistake.topicId)
  );

  if (unassignedMistakes.length > 0) {
    rows.push(
      buildCoverageRow(
        "general",
        "General / Unassigned",
        false,
        unassignedMistakes,
        true
      )
    );
  }

  return rows.sort((a, b) => {
    if (a.unreviewedCount !== b.unreviewedCount) {
      return b.unreviewedCount - a.unreviewedCount;
    }
    if (a.isWeakArea !== b.isWeakArea) return a.isWeakArea ? -1 : 1;
    if (a.progressPercent !== b.progressPercent) {
      return a.progressPercent - b.progressPercent;
    }
    return a.name.localeCompare(b.name);
  });
}

function buildCoverageRow(
  topicId: string,
  name: string,
  hasMaterials: boolean,
  mistakes: Mistake[],
  isGeneral: boolean
): TopicCoverageRow {
  const mistakeCount = mistakes.length;
  const reviewedCount = mistakes.filter((mistake) => mistake.reviewed).length;
  const unreviewedCount = mistakeCount - reviewedCount;

  let state: TopicCoverageState;
  let progressPercent: number;

  if (mistakeCount > 0 && reviewedCount === mistakeCount) {
    state = "Reviewed";
    progressPercent = 100;
  } else if (mistakeCount > 0) {
    state = "Practiced";
    progressPercent = 70;
  } else if (hasMaterials) {
    state = "Has materials";
    progressPercent = 35;
  } else {
    state = "No materials";
    progressPercent = 0;
  }

  if (!isGeneral && !hasMaterials) {
    state = "No materials";
    progressPercent = 0;
  }

  return {
    topicId,
    name,
    state,
    progressPercent,
    mistakeCount,
    unreviewedCount,
    reviewedCount,
    hasMaterials,
    isWeakArea: unreviewedCount > 0,
  };
}

export function computeTodaysPlan(
  project: StudyProject,
  topics: Topic[],
  materials: Material[],
  mistakes: Mistake[],
  goals: ProjectGoals | null = null,
  weeklyProgress: WeeklyProgressMetrics | null = null
): TodaysPlanMetrics {
  const base = `/projects/${project.id}`;
  const materialIds = materialTopicIds(materials);
  const unreviewedMistakes = mistakes.filter((mistake) => !mistake.reviewed);
  const focusTopicIds =
    goals && Array.isArray(goals.focusTopicIds) ? goals.focusTopicIds : [];
  const focusTopics = goals
    ? topics.filter((topic) => focusTopicIds.includes(topic.id))
    : [];
  const actions: TodaysPlanAction[] = [];

  function add(action: TodaysPlanAction) {
    if (!actions.some((existing) => existing.href === action.href)) {
      actions.push(action);
    }
  }

  if (topics.length === 0) {
    add({
      title: "Add topics",
      description: "Define what the exam covers so Ivvy can structure training.",
      href: `${base}/setup`,
      kind: "setup",
    });
  } else {
    if (materialIds.size === 0) {
      add({
        title: "Add materials",
        description: "Attach notes or past papers so training uses your course.",
        href: `${base}/materials`,
        kind: "materials",
      });
    }

    if (mistakes.length === 0) {
      add({
        title: "Start training",
        description: "Answer focused exam questions and begin finding weak areas.",
        href: `${base}/train`,
        kind: "training",
      });
    }

    if (unreviewedMistakes.length > 0) {
      if (goals && weeklyProgress && !weeklyProgress.reviewsMet) {
        add({
          title: `Review toward your weekly goal (${weeklyProgress.reviewsDone} of ${weeklyProgress.reviewGoal})`,
          description: "Keep your review streak on pace for this week.",
          href: `${base}/review`,
          kind: "review",
        });
      } else {
        add({
          title: `Review ${unreviewedMistakes.length} mistake${
            unreviewedMistakes.length === 1 ? "" : "s"
          }`,
          description: "Retry saved mistakes before they fade from memory.",
          href: `${base}/review`,
          kind: "review",
        });
      }
    }

    // Goal-aware: focus topics chosen in goals take priority over generic gaps.
    const focusTopicWithoutMaterials = focusTopics.find(
      (topic) => !materialIds.has(topic.id)
    );
    if (focusTopicWithoutMaterials) {
      add({
        title: `Add materials for ${focusTopicWithoutMaterials.name}`,
        description: "This is one of your focus topics — give Ivvy something to train on.",
        href: `${base}/materials`,
        kind: "materials",
      });
    }

    const focusTopicToTrain = focusTopics.find((topic) =>
      materialIds.has(topic.id)
    );
    if (focusTopicToTrain) {
      add({
        title: `Train your focus topic: ${focusTopicToTrain.name}`,
        description: "You marked this as a priority for the exam.",
        href: `${base}/train?topic=${encodeURIComponent(focusTopicToTrain.id)}`,
        kind: "training",
      });
    }

    const topicWithoutMaterials = topics.find(
      (topic) => !materialIds.has(topic.id)
    );
    if (topicWithoutMaterials) {
      add({
        title: `Add materials for ${topicWithoutMaterials.name}`,
        description: "Fill the next coverage gap in your training map.",
        href: `${base}/materials`,
        kind: "materials",
      });
    }

    const weakest = topics
      .map((topic) => ({
        topic,
        count: unreviewedMistakes.filter(
          (mistake) => mistake.topicId === topic.id
        ).length,
      }))
      .sort((a, b) => b.count - a.count)[0];

    if (weakest && weakest.count > 0) {
      add({
        title: `Train weakest area: ${weakest.topic.name}`,
        description: `${weakest.count} unreviewed mistake${
          weakest.count === 1 ? "" : "s"
        } point${weakest.count === 1 ? "s" : ""} to this topic.`,
        href: `${base}/train?topic=${encodeURIComponent(weakest.topic.id)}`,
        kind: "training",
      });
    }

    // Goal-aware: remind the student to log effort toward the weekly session goal.
    if (weeklyProgress && !weeklyProgress.sessionsMet) {
      add({
        title: `Log a session toward your weekly goal (${weeklyProgress.sessionsDone} of ${weeklyProgress.sessionGoal})`,
        description: "Record study, chat, or review time to track your week.",
        href: `${base}/log`,
        kind: "training",
      });
    }

    add({
      title: "Keep training",
      description: "Continue with focused exam questions to maintain momentum.",
      href: `${base}/train`,
      kind: "training",
    });
  }

  const primary = actions[0];
  const examDays = daysUntil(project.examDate);
  const urgency =
    examDays !== null && examDays <= 7
      ? examDays === 0
        ? "The exam date has arrived. "
        : `The exam is in ${examDays} day${examDays === 1 ? "" : "s"}. `
      : "";

  return {
    primary: {
      ...primary,
      description: urgency + primary.description,
    },
    secondary: actions.slice(1, 3),
  };
}
