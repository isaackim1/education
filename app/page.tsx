"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getExam, getStudyPlan, getTopics } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const exam = getExam();
    const plan = getStudyPlan();
    const topics = getTopics();

    if (exam && plan && topics.length > 0) {
      router.replace("/plan");
    } else {
      router.replace("/setup");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-neutral-600">Loading StudyCoach...</p>
    </main>
  );
}
