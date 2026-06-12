"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/marketing/LandingPage";
import { getProjects } from "@/lib/project-storage";
import { getExam, getStudyPlan, getTopics } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState<boolean | null>(null);

  useEffect(() => {
    const exam = getExam();
    const plan = getStudyPlan();
    const topics = getTopics();

    if (exam && plan && topics.length > 0) {
      router.replace("/projects");
    } else if (getProjects().length > 0) {
      router.replace("/projects");
    } else {
      setShowLanding(true);
    }
  }, [router]);

  if (showLanding === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
        <p className="text-sm text-[#56524B]">Loading...</p>
      </main>
    );
  }

  return <LandingPage />;
}
