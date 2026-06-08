"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SessionContent() {
  const searchParams = useSearchParams();
  const day = searchParams.get("day") ?? "—";

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">
          StudyCoach
        </h1>
        <p className="text-sm text-neutral-600 mb-2">
          Session coming in Milestone 3.
        </p>
        <p className="text-sm text-neutral-500 mb-8">Day: {day}</p>
        <Link
          href="/plan"
          className="text-sm text-neutral-600 underline hover:text-black"
        >
          Back to plan
        </Link>
      </div>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-neutral-600">Loading...</p>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
