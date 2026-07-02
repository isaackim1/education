import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  buildContextMessage,
  buildSystemPrompt,
  type AgentContext,
  type ReviewMistakeContext,
  type TopicMaterial,
} from "@/lib/prompts";
import type { MistakeCategory } from "@/lib/types";

export const runtime = "nodejs";

const MAX_SYSTEM_PROMPT_CHARS = 4000;
const MAX_CONTEXT_MESSAGE_CHARS = 10000;

interface AgentRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: AgentContext;
  systemPrompt?: string;
  contextMessage?: string;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isAgentRequest(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    const projectPromptRequest = isProjectPromptRequest(body);
    const system = projectPromptRequest
      ? body.systemPrompt.trim()
      : buildSystemPrompt();
    const contextContent = projectPromptRequest
      ? body.contextMessage.trim()
      : buildContextMessage(body.context as AgentContext);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system,
      messages: [
        { role: "user", content: contextContent },
        { role: "assistant", content: "Understood." },
        ...body.messages.slice(-10),
      ],
    });

    const firstBlock = response.content[0];
    const rawReply =
      firstBlock?.type === "text" ? firstBlock.text : "";

    const resolvedMatch = rawReply.match(/^\[RESOLVED\]\s*/i);
    const resolved = Boolean(resolvedMatch);
    const afterResolved = resolvedMatch
      ? rawReply.slice(resolvedMatch[0].length).trim()
      : rawReply;

    const mistakeMatch = afterResolved.match(
      /^\[MISTAKE(?::(\w+)(?::([^\]]+))?)?\]\s*/i
    );
    const flaggedMistake = !resolved && Boolean(mistakeMatch);
    const rawCategory = mistakeMatch?.[1]?.toLowerCase() ?? "";
    const mistakeTopicName = mistakeMatch?.[2]?.trim() || null;
    const mistakeCategory: MistakeCategory = isMistakeCategory(rawCategory)
      ? rawCategory
      : "conceptual";
    const reply = mistakeMatch
      ? afterResolved.slice(mistakeMatch[0].length).trim()
      : afterResolved.trim();

    if (!reply) {
      throw new Error("Agent returned no text");
    }

    return NextResponse.json({
      reply,
      flaggedMistake,
      mistakeCategory,
      mistakeTopicName,
      resolved,
    });
  } catch {
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}

function isAgentRequest(body: unknown): body is AgentRequestBody {
  if (typeof body !== "object" || body === null) return false;
  if (!("messages" in body) || !Array.isArray(body.messages)) return false;

  const messagesValid = body.messages.every(
    (message) =>
      typeof message === "object" &&
      message !== null &&
      "role" in message &&
      (message.role === "user" || message.role === "assistant") &&
      "content" in message &&
      typeof message.content === "string"
  );

  if (!messagesValid) return false;

  if (isProjectPromptRequest(body)) return true;

  return "context" in body && isAgentContext(body.context);
}

function isProjectPromptRequest(
  body: unknown
): body is AgentRequestBody & { systemPrompt: string; contextMessage: string } {
  if (typeof body !== "object" || body === null) return false;

  return (
    "systemPrompt" in body &&
    typeof body.systemPrompt === "string" &&
    body.systemPrompt.trim().length > 0 &&
    body.systemPrompt.length <= MAX_SYSTEM_PROMPT_CHARS &&
    "contextMessage" in body &&
    typeof body.contextMessage === "string" &&
    body.contextMessage.trim().length > 0 &&
    body.contextMessage.length <= MAX_CONTEXT_MESSAGE_CHARS
  );
}

function isAgentContext(context: unknown): context is AgentContext {
  if (typeof context !== "object" || context === null) return false;
  if (!("subject" in context) || typeof context.subject !== "string") {
    return false;
  }
  if (!("examDate" in context) || typeof context.examDate !== "string") {
    return false;
  }
  if (
    !("daysRemaining" in context) ||
    typeof context.daysRemaining !== "number" ||
    !Number.isFinite(context.daysRemaining)
  ) {
    return false;
  }
  if (!("notes" in context) || typeof context.notes !== "string") {
    return false;
  }
  if (!("pastQuestions" in context) || typeof context.pastQuestions !== "string") {
    return false;
  }
  if (
    !("todayTopicNames" in context) ||
    !Array.isArray(context.todayTopicNames) ||
    !context.todayTopicNames.every((topic) => typeof topic === "string")
  ) {
    return false;
  }
  if (!("mode" in context) || typeof context.mode !== "string") {
    return false;
  }

  if (
    "mistakeContext" in context &&
    context.mistakeContext !== undefined &&
    !isReviewMistakeContext(context.mistakeContext)
  ) {
    return false;
  }

  if (
    "topicMaterials" in context &&
    context.topicMaterials !== undefined
  ) {
    if (
      !Array.isArray(context.topicMaterials) ||
      !context.topicMaterials.every(isTopicMaterial)
    ) {
      return false;
    }
  }

  return true;
}

function isReviewMistakeContext(value: unknown): value is ReviewMistakeContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "originalQuestion" in value &&
    typeof value.originalQuestion === "string" &&
    "studentAnswer" in value &&
    typeof value.studentAnswer === "string" &&
    "correctApproach" in value &&
    typeof value.correctApproach === "string" &&
    "mistakeCategory" in value &&
    typeof value.mistakeCategory === "string" &&
    "topicName" in value &&
    typeof value.topicName === "string"
  );
}

function isTopicMaterial(value: unknown): value is TopicMaterial {
  return (
    typeof value === "object" &&
    value !== null &&
    "topicName" in value &&
    typeof value.topicName === "string" &&
    "notes" in value &&
    typeof value.notes === "string" &&
    "pastQuestions" in value &&
    typeof value.pastQuestions === "string"
  );
}

function isMistakeCategory(value: unknown): value is MistakeCategory {
  return (
    value === "conceptual" ||
    value === "calculation" ||
    value === "recall" ||
    value === "application"
  );
}
