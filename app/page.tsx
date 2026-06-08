"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getExam, getStudyPlan } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const exam = getExam();
    const plan = getStudyPlan();

    if (exam && plan) {
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
