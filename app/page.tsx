"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/marketing/LandingPage";
import { getExam, getStudyPlan, getTopics } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState<boolean | null>(null);

  useEffect(() => {
    const exam = getExam();
    const plan = getStudyPlan();
    const topics = getTopics();

    if (exam && plan && topics.length > 0) {
      router.replace("/plan");
    } else {
      setShowLanding(true);
    }
  }, [router]);

  if (showLanding === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-neutral-600">Loading StudyCoach...</p>
      </main>
    );
  }

  return <LandingPage />;
}
