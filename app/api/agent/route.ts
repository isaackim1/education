import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  buildContextMessage,
  buildSystemPrompt,
  type AgentContext,
} from "@/lib/prompts";

export const runtime = "nodejs";

interface AgentRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  context: AgentContext;
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

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: buildSystemPrompt(),
      messages: [
        { role: "user", content: buildContextMessage(body.context) },
        { role: "assistant", content: "Understood." },
        ...body.messages.slice(-10),
      ],
    });

    const firstBlock = response.content[0];
    const rawReply =
      firstBlock?.type === "text" ? firstBlock.text : "";

    const mistakeMatch = rawReply.match(/^\[MISTAKE\]\s*/i);
    const flaggedMistake = Boolean(mistakeMatch);
    const reply = mistakeMatch
      ? rawReply.slice(mistakeMatch[0].length).trim()
      : rawReply.trim();

    if (!reply) {
      throw new Error("Agent returned no text");
    }

    return NextResponse.json({ reply, flaggedMistake });
  } catch {
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}

function isAgentRequest(body: unknown): body is AgentRequestBody {
  if (typeof body !== "object" || body === null) return false;
  if (!("messages" in body) || !Array.isArray(body.messages)) return false;
  if (!("context" in body) || !isAgentContext(body.context)) return false;

  return body.messages.every(
    (message) =>
      typeof message === "object" &&
      message !== null &&
      "role" in message &&
      (message.role === "user" || message.role === "assistant") &&
      "content" in message &&
      typeof message.content === "string"
  );
}

function isAgentContext(context: unknown): context is AgentContext {
  return (
    typeof context === "object" &&
    context !== null &&
    "subject" in context &&
    typeof context.subject === "string" &&
    "examDate" in context &&
    typeof context.examDate === "string" &&
    "daysRemaining" in context &&
    typeof context.daysRemaining === "number" &&
    Number.isFinite(context.daysRemaining) &&
    "notes" in context &&
    typeof context.notes === "string" &&
    "pastQuestions" in context &&
    typeof context.pastQuestions === "string" &&
    "todayTopicNames" in context &&
    Array.isArray(context.todayTopicNames) &&
    context.todayTopicNames.every((topic) => typeof topic === "string") &&
    "mode" in context &&
    typeof context.mode === "string"
  );
}
