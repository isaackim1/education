import { NextResponse } from "next/server";
import { generateLocalStudyPlan } from "@/lib/plan-generator";
import type { Exam, Topic } from "@/lib/types";

// TODO: Integrate Anthropic API for AI-generated study plans.
// TODO: Use exam notes and past questions to personalize daily goals.
// TODO: Adjust session types based on confidence level and weak topics.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const exam = body.exam as Exam;
    const topics = body.topics as Topic[];

    if (!exam || !topics || !Array.isArray(topics)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const plan = generateLocalStudyPlan(exam, topics);

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate study plan" },
      { status: 500 }
    );
  }
}
