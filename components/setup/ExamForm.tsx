"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { DailyPlan, Exam, StudyPlan, Topic } from "@/lib/types";
import { generateLocalStudyPlan } from "@/lib/plan-generator";
import {
  clearAllStudyCoachData,
  saveExam,
  saveStudyPlan,
  saveTopics,
} from "@/lib/storage";
import { generateId } from "@/lib/utils";

export default function ExamForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [studyHours, setStudyHours] = useState(2);
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [topicsText, setTopicsText] = useState("");
  const [notes, setNotes] = useState("");
  const [pastQuestions, setPastQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const seenTopics = new Set<string>();
    const topicNames = topicsText.split("\n").reduce<string[]>((names, line) => {
      const name = line.trim();
      const normalizedName = name.toLocaleLowerCase();
      if (name && !seenTopics.has(normalizedName)) {
        seenTopics.add(normalizedName);
        names.push(name);
      }
      return names;
    }, []);

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!examDate) {
      setError("Exam date is required.");
      return;
    }
    if (Number.isNaN(new Date(`${examDate}T00:00:00`).getTime())) {
      setError("Enter a valid exam date.");
      return;
    }
    if (topicNames.length === 0) {
      setError("Add at least one topic.");
      return;
    }
    if (!Number.isFinite(studyHours) || studyHours < 1 || studyHours > 8) {
      setError("Study hours must be between 1 and 8.");
      return;
    }

    setLoading(true);

    try {
      const examId = generateId();
      const exam: Exam = {
        id: examId,
        subject: subject.trim(),
        examDate,
        studyHoursPerDay: studyHours,
        confidenceLevel,
        topicNames,
        notes: notes.trim(),
        pastQuestions: pastQuestions.trim(),
        createdAt: new Date().toISOString(),
      };

      const topics: Topic[] = topicNames.map((name) => ({
        id: generateId(),
        examId,
        name,
        masteryScore: 0,
        isWeakTopic: true,
        mistakeCount: 0,
        lastStudied: null,
        masteryHistory: [],
        notes: "",
        pastQuestions: "",
      }));

      let plan: StudyPlan;
      try {
        const response = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exam, topics }),
        });
        if (response.ok) {
          const data: unknown = await response.json();
          plan = getPlanFromResponse(data) ?? generateLocalStudyPlan(exam, topics);
        } else {
          plan = generateLocalStudyPlan(exam, topics);
        }
      } catch {
        plan = generateLocalStudyPlan(exam, topics);
      }

      const savedExam = saveExam(exam);
      const savedTopics = saveTopics(topics);
      const savedPlan = saveStudyPlan(plan);
      if (!savedExam || !savedTopics || !savedPlan) {
        clearAllStudyCoachData();
        throw new Error("Unable to save study plan");
      }
      router.push("/plan");
    } catch {
      setError(
        "We could not generate and save your study plan. Check your browser storage and try again."
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Macroeconomics"
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label htmlFor="examDate" className="block text-sm font-medium mb-1">
          Exam date
        </label>
        <input
          id="examDate"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label htmlFor="studyHours" className="block text-sm font-medium mb-1">
          Study hours per day
        </label>
        <input
          id="studyHours"
          type="number"
          min={1}
          max={8}
          value={studyHours}
          onChange={(e) => setStudyHours(Number(e.target.value))}
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          disabled={loading}
          required
        />
      </div>

      <div>
        <span className="block text-sm font-medium mb-2">
          Confidence level (1 = low, 5 = high)
        </span>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setConfidenceLevel(level)}
              disabled={loading}
              className={`w-10 h-10 rounded border text-sm font-medium transition-colors ${
                confidenceLevel === level
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-neutral-300 hover:border-black"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="topics" className="block text-sm font-medium mb-1">
          Topics (one per line)
        </label>
        <textarea
          id="topics"
          value={topicsText}
          onChange={(e) => setTopicsText(e.target.value)}
          rows={6}
          placeholder={"Supply and Demand\nElasticity\nInflation"}
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-y"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything the coach should know about your exam..."
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-y"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="pastQuestions"
          className="block text-sm font-medium mb-1"
        >
          Past questions (optional)
        </label>
        <textarea
          id="pastQuestions"
          value={pastQuestions}
          onChange={(e) => setPastQuestions(e.target.value)}
          rows={3}
          placeholder="Paste past exam questions here..."
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-y"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2.5 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Building your plan..." : "Create study plan"}
      </button>
    </form>
  );
}

function getPlanFromResponse(value: unknown): StudyPlan | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("plan" in value) ||
    !isStudyPlan(value.plan)
  ) {
    return null;
  }

  return value.plan;
}

function isStudyPlan(value: unknown): value is StudyPlan {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "examId" in value &&
    typeof value.examId === "string" &&
    "generatedAt" in value &&
    typeof value.generatedAt === "string" &&
    "days" in value &&
    Array.isArray(value.days) &&
    value.days.length === 14 &&
    value.days.every(isDailyPlan)
  );
}

function isDailyPlan(value: unknown): value is DailyPlan {
  if (typeof value !== "object" || value === null) return false;

  return (
    "day" in value &&
    typeof value.day === "number" &&
    "date" in value &&
    typeof value.date === "string" &&
    "topicIds" in value &&
    Array.isArray(value.topicIds) &&
    value.topicIds.every((id) => typeof id === "string") &&
    "sessionType" in value &&
    ["learn", "quiz", "review", "exam-sim"].includes(
      String(value.sessionType)
    ) &&
    "goalDescription" in value &&
    typeof value.goalDescription === "string" &&
    "estimatedMinutes" in value &&
    typeof value.estimatedMinutes === "number" &&
    Number.isFinite(value.estimatedMinutes) &&
    "completed" in value &&
    typeof value.completed === "boolean" &&
    "sessionId" in value &&
    (typeof value.sessionId === "string" || value.sessionId === null)
  );
}
