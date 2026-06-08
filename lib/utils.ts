import type { MasteryLevel, Topic } from "./types";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function daysUntilExam(examDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  const diffMs = exam.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function computeWeakTopics(topics: Topic[]): Topic[] {
  return topics.filter((topic) => topic.masteryScore <= 2);
}

export function getNextReviewDate(reviewCount: number): string {
  const date = new Date();
  if (reviewCount <= 1) {
    date.setDate(date.getDate() + 2);
  } else if (reviewCount === 2) {
    date.setDate(date.getDate() + 5);
  } else {
    date.setDate(date.getDate() + 10);
  }
  return date.toISOString().split("T")[0];
}

export function clampMasteryScore(score: number): MasteryLevel {
  const clamped = Math.max(0, Math.min(5, Math.round(score)));
  return clamped as MasteryLevel;
}

export function getTodayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function addDaysToDate(baseDate: string, days: number): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}
