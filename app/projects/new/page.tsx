"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjects();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
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

    setSubmitting(true);
    const project = createProject({
      name,
      subject,
      examDate,
      targetGrade: targetGrade.trim() || "Pass",
    });
    router.push(`/projects/${project.id}`);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        <header className="mb-8">
          <Link
            href="/projects"
            className="text-sm text-neutral-500 underline hover:text-black transition-colors"
          >
            ← Back to projects
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-black mt-4">
            Create training project
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Set up one exam. You will add topics and materials next, then train
            in chat.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="project-name"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              Project name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Microeconomics final"
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <p className="text-xs text-neutral-400 mt-1">
              A name you will recognize when you return to train.
            </p>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Microeconomics"
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label
              htmlFor="exam-date"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              Exam date
            </label>
            <input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label
              htmlFor="target-grade"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              Target grade
            </label>
            <input
              id="target-grade"
              type="text"
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              placeholder="Pass, 80%+, A, etc."
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black text-white text-sm py-2.5 rounded font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create project
          </button>
        </form>
      </div>
    </main>
  );
}
