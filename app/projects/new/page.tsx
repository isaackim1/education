"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";

const LABEL = "block text-sm font-medium text-[#1A1A17] mb-1.5";
const INPUT =
  "w-full h-12 rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#7A766D] transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15";
const HELPER = "text-xs text-[#56524B] mt-1.5";

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
    if (!project) {
      setSubmitting(false);
      setError(
        "Ivvy could not save this project in your browser. Export a backup or free storage, then try again."
      );
      return;
    }
    router.push(`/projects/${project.id}`);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-12">
        <Link
          href="/projects"
          className="inline-flex items-center h-9 -ml-3 px-3 rounded-full text-sm text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
        >
          Back to projects
        </Link>

        <header className="mt-4 mb-6">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1A1A17]">
            Create training project
          </h1>
          <p className="text-sm text-[#56524B] mt-2">
            Set up one exam. You will add topics and materials next, then train in
            chat.
          </p>
        </header>

        <div className="rounded-2xl border border-[#E7E3DA] bg-white p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="project-name" className={LABEL}>
                Project name
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Microeconomics final"
                className={INPUT}
              />
              <p className={HELPER}>
                A name you will recognize when you return to train.
              </p>
            </div>

            <div>
              <label htmlFor="subject" className={LABEL}>
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Microeconomics"
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="exam-date" className={LABEL}>
                Exam date
              </label>
              <input
                id="exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="target-grade" className={LABEL}>
                Target grade
              </label>
              <input
                id="target-grade"
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="Pass, 80%+, A, etc."
                className={INPUT}
              />
              <p className={HELPER}>Optional. Defaults to Pass.</p>
            </div>

            {error ? (
              <p
                className="rounded-lg bg-[#F9DEDC] px-3 py-2 text-sm text-[#410E0B]"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-md bg-[#1E4634] text-white text-sm font-medium transition-colors hover:bg-[#16382A] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
            >
              Create project
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
