import { NextResponse } from "next/server";
import {
  generateLocalStudyPlan,
  type PlanGenerationExam,
  type PlanGenerationTopic,
} from "@/lib/plan-generator";

// TODO: Integrate Anthropic API for AI-generated study plans.
// TODO: Use exam notes and past questions to personalize daily goals.
// TODO: Adjust session types based on confidence level and weak topics.

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isPlanRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const plan = generateLocalStudyPlan(body.exam, body.topics);

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate study plan" },
      { status: 500 }
    );
  }
}

function isPlanRequest(
  value: unknown
): value is { exam: PlanGenerationExam; topics: PlanGenerationTopic[] } {
  if (typeof value !== "object" || value === null) return false;
  if (!("exam" in value) || !("topics" in value)) return false;

  const { exam, topics } = value;
  if (typeof exam !== "object" || exam === null || !Array.isArray(topics)) {
    return false;
  }

  return (
    "id" in exam &&
    typeof exam.id === "string" &&
    "studyHoursPerDay" in exam &&
    typeof exam.studyHoursPerDay === "number" &&
    Number.isFinite(exam.studyHoursPerDay) &&
    exam.studyHoursPerDay > 0 &&
    topics.length > 0 &&
    topics.every(
      (topic) =>
        typeof topic === "object" &&
        topic !== null &&
        "id" in topic &&
        typeof topic.id === "string" &&
        "name" in topic &&
        typeof topic.name === "string" &&
        topic.name.trim().length > 0
    )
  );
}
