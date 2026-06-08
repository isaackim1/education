import type { MasteryLevel, Topic } from "./types";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function daysUntilExam(examDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(`${examDate}T00:00:00`);
  if (Number.isNaN(exam.getTime())) return 0;
  const diffMs = exam.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function formatDate(isoString: string): string {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(isoString)
      ? `${isoString}T00:00:00`
      : isoString
  );
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
  return formatLocalIsoDate(date);
}

export function clampMasteryScore(score: number): MasteryLevel {
  const clamped = Math.max(0, Math.min(5, Math.round(score)));
  return clamped as MasteryLevel;
}

export function getTodayIsoDate(): string {
  return formatLocalIsoDate(new Date());
}

export function addDaysToDate(baseDate: string, days: number): string {
  const date = new Date(`${baseDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid base date");
  }
  date.setDate(date.getDate() + days);
  return formatLocalIsoDate(date);
}

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
