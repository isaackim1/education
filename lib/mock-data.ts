import type { Exam, Topic } from "./types";
import { generateLocalStudyPlan } from "./plan-generator";
import { addDaysToDate, generateId, getTodayIsoDate } from "./utils";

const today = getTodayIsoDate();
const examId = generateId();

export const mockExam: Exam = {
  id: examId,
  subject: "Macroeconomics",
  examDate: addDaysToDate(today, 14),
  studyHoursPerDay: 2,
  confidenceLevel: 2,
  topicNames: [
    "Supply and Demand",
    "Elasticity",
    "GDP and National Income",
    "Inflation",
    "Monetary Policy",
    "Fiscal Policy",
    "International Trade",
    "Exchange Rates",
  ],
  notes: "",
  pastQuestions: "",
  createdAt: new Date().toISOString(),
};

const topicMastery: Record<string, 0 | 1 | 2> = {
  "Supply and Demand": 1,
  Elasticity: 0,
  "GDP and National Income": 2,
  Inflation: 1,
  "Monetary Policy": 0,
  "Fiscal Policy": 0,
  "International Trade": 0,
  "Exchange Rates": 0,
};

export const mockTopics: Topic[] = mockExam.topicNames.map((name) => {
  const masteryScore = topicMastery[name] ?? 0;
  return {
    id: generateId(),
    examId,
    name,
    masteryScore,
    isWeakTopic: masteryScore <= 2,
    mistakeCount: 0,
    lastStudied: null,
    masteryHistory: [],
  };
});

export const mockStudyPlan = generateLocalStudyPlan(mockExam, mockTopics);
