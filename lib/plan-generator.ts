import type { DailyPlan, Exam, SessionType, StudyPlan, Topic } from "./types";
import { addDaysToDate, generateId, getTodayIsoDate } from "./utils";

export type PlanGenerationExam = Pick<Exam, "id" | "studyHoursPerDay">;
export type PlanGenerationTopic = Pick<Topic, "id" | "name">;

const DAY_COUNT = 14;

const SESSION_SCHEDULE: SessionType[] = [
  "learn",
  "learn",
  "learn",
  "learn",
  "learn",
  "quiz",
  "quiz",
  "quiz",
  "quiz",
  "review",
  "review",
  "review",
  "exam-sim",
  "exam-sim",
];

const GOAL_TEMPLATES: Record<SessionType, (topicNames: string[]) => string> = {
  learn: (names) =>
    `Learn core concepts for ${names.join(", ")} through active recall questions before explanations.`,
  quiz: (names) =>
    `Test yourself on ${names.join(", ")} with exam-style questions and identify gaps.`,
  review: (names) =>
    `Review weak areas in ${names.join(", ")} and revisit mistakes from earlier sessions.`,
  "exam-sim": (names) =>
    `Simulate exam conditions covering ${names.join(", ")} under timed pressure.`,
};

function distributeTopicsAcrossDays(
  topics: PlanGenerationTopic[],
  dayCount: number
): string[][] {
  if (topics.length === 0) {
    return Array.from({ length: dayCount }, () => []);
  }

  const assignments: string[][] = Array.from({ length: dayCount }, () => []);
  topics.forEach((topic, index) => {
    const dayIndex = index % dayCount;
    assignments[dayIndex].push(topic.id);
  });

  // Ensure each day has at least one topic by cycling through
  for (let day = 0; day < dayCount; day++) {
    if (assignments[day].length === 0) {
      const topic = topics[day % topics.length];
      assignments[day].push(topic.id);
    }
  }

  return assignments;
}

export function generateLocalStudyPlan(
  exam: PlanGenerationExam,
  topics: PlanGenerationTopic[]
): StudyPlan {
  const today = getTodayIsoDate();
  const topicAssignments = distributeTopicsAcrossDays(topics, DAY_COUNT);
  const estimatedMinutes = Math.round(exam.studyHoursPerDay * 60);

  if (!Number.isFinite(estimatedMinutes) || estimatedMinutes <= 0) {
    throw new Error("Study hours per day must be a positive number");
  }

  const days: DailyPlan[] = Array.from({ length: DAY_COUNT }, (_, index) => {
    const sessionType = SESSION_SCHEDULE[index % SESSION_SCHEDULE.length];
    const dayNumber = index + 1;
    const topicIds = topicAssignments[index];
    const topicNames = topicIds
      .map((id) => topics.find((t) => t.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    return {
      day: dayNumber,
      date: addDaysToDate(today, index),
      topicIds,
      sessionType,
      goalDescription: GOAL_TEMPLATES[sessionType](topicNames),
      estimatedMinutes,
      completed: false,
      sessionId: null,
    };
  });

  return {
    id: generateId(),
    examId: exam.id,
    days,
    generatedAt: new Date().toISOString(),
  };
}
