import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  buildMaterialSortingContextMessage,
  buildMaterialSortingSystemPrompt,
  normalizeSortingSegments,
  normalizeSortingTopics,
  sanitizeMaterialAssignments,
} from "@/lib/material-sorting-prompts";

export const runtime = "nodejs";

interface SortMaterialRequestBody {
  topics: string[];
  segments: string[];
  subject?: string;
}

export async function POST(request: Request) {
  // Malformed JSON is a client problem → 400, never a 500.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    if (!isSortMaterialRequest(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const topics = normalizeSortingTopics(body.topics);
    const segments = normalizeSortingSegments(body.segments);

    // Nothing to sort — return all-null deterministically without calling the model.
    if (topics.length === 0 || segments.length === 0) {
      return NextResponse.json({
        assignments: sanitizeMaterialAssignments(null, topics, segments.length),
      });
    }

    const anthropic = new Anthropic({ apiKey });

    let assignments;
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: buildMaterialSortingSystemPrompt(),
        messages: [
          {
            role: "user",
            content: buildMaterialSortingContextMessage({
              topics,
              segments,
              subject: body.subject,
            }),
          },
        ],
      });

      const rawText = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      assignments = sanitizeMaterialAssignments(rawText, topics, segments.length);
    } catch {
      // Model/network failure: degrade to all-unsorted so the import can still
      // proceed with manual assignment, rather than failing the whole request.
      assignments = sanitizeMaterialAssignments(null, topics, segments.length);
    }

    return NextResponse.json({ assignments });
  } catch {
    // Never expose raw model/runtime errors to the client.
    return NextResponse.json(
      { error: "Could not sort material" },
      { status: 500 }
    );
  }
}

function isSortMaterialRequest(body: unknown): body is SortMaterialRequestBody {
  if (typeof body !== "object" || body === null) return false;

  if (
    !("topics" in body) ||
    !Array.isArray(body.topics) ||
    !body.topics.every((topic) => typeof topic === "string")
  ) {
    return false;
  }

  if (
    !("segments" in body) ||
    !Array.isArray(body.segments) ||
    !body.segments.every((segment) => typeof segment === "string")
  ) {
    return false;
  }

  if (
    "subject" in body &&
    body.subject !== undefined &&
    typeof body.subject !== "string"
  ) {
    return false;
  }

  return true;
}
