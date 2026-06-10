import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  buildTopicExtractionContextMessage,
  buildTopicExtractionSystemPrompt,
  sanitizeTopics,
} from "@/lib/topic-extraction-prompts";

export const runtime = "nodejs";

const MATERIAL_TEXT_LIMIT = 12_000;

interface ExtractTopicsRequestBody {
  materialText: string;
  subject?: string;
  existingTopics?: string[];
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isExtractTopicsRequest(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const materialText = body.materialText.slice(0, MATERIAL_TEXT_LIMIT);
    const existingTopics = body.existingTopics ?? [];
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: buildTopicExtractionSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildTopicExtractionContextMessage({
            subject: body.subject ?? "",
            existingTopics,
            materialText,
          }),
        },
      ],
    });

    const rawTopics = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    const existingNames = new Set(
      existingTopics.map((topic) => topic.trim().toLocaleLowerCase())
    );
    const topics = sanitizeTopics(rawTopics).filter(
      (topic) => !existingNames.has(topic.toLocaleLowerCase())
    );

    return NextResponse.json({ topics });
  } catch {
    return NextResponse.json(
      { error: "Could not generate training map" },
      { status: 500 }
    );
  }
}

function isExtractTopicsRequest(
  body: unknown
): body is ExtractTopicsRequestBody {
  if (typeof body !== "object" || body === null) return false;
  if (
    !("materialText" in body) ||
    typeof body.materialText !== "string" ||
    body.materialText.trim().length === 0
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

  if (
    "existingTopics" in body &&
    body.existingTopics !== undefined &&
    (!Array.isArray(body.existingTopics) ||
      !body.existingTopics.every((topic) => typeof topic === "string"))
  ) {
    return false;
  }

  return true;
}
