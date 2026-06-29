import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { FeedForwardResult } from "@/lib/du/types";

/**
 * Feed-Forward Brain (Phase DU-1A) — the re-cast of Ivvy's Assessment Brain.
 *
 * Generates structured, founder-oriented feed-forward for an Effectuation
 * Roadmap submission. This is feed-forward, NOT grading: no score, no pass/fail.
 * Reuses the same provider/model/env conventions as app/api/agent/route.ts. If
 * no API key is configured, returns a coherent demo report so the local demo
 * path still works end-to-end.
 */

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

interface FeedForwardRequest {
  founderProfile: {
    ventureName?: string;
    idea?: string;
    stage?: string;
    targetCustomer?: string;
    currentChallenge?: string;
    goals?: string[];
  };
  submission: {
    sections: Record<string, string>;
  };
  moduleContext: {
    moduleTitle?: string;
    assignmentTitle?: string;
    sections?: { id: string; prompt: string }[];
  };
}

const SYSTEM_PROMPT = `You are the Feed-Forward Brain inside Unknown Digital University — a digital campus where founders learn entrepreneurship by building their own venture.

You give FEED-FORWARD, not grading. Absolute rules:
- Never give a score, grade, percentage, or pass/fail. Never rank.
- This is forward-looking: what to do next, not what was "wrong".
- Be direct, constructive, and founder-focused. No fluffy praise, no generic startup advice.
- Ground everything in effectuation and an Unknown-style, build-from-day-one philosophy: start with your means (bird-in-hand), affordable loss, partnerships/co-creation (crazy-quilt), surprises as input (lemonade), agency (pilot-in-the-plane), and connecting work to the Business Model Canvas.
- Challenge unsupported assumptions directly but respectfully.
- Identify exactly what a sharp human mentor would question in a review.
- Always end on momentum: one concrete next action the founder can take this week.

Return ONLY a JSON object (no prose, no markdown fences) with exactly these keys:
{
  "strengths": string[],
  "unclearAreas": string[],
  "unsupportedAssumptions": string[],
  "conceptConnections": string[],
  "mentorQuestions": string[],
  "improvementSteps": string[],
  "nextAction": string,
  "summary": string
}
Each array: 2-5 short, specific items. "conceptConnections" should explicitly tie the founder's work to named effectuation principles. "nextAction" is a single concrete action. "summary" is 1-2 sentences, founder-to-founder in tone.`;

export async function POST(request: Request) {
  let body: FeedForwardRequest;
  try {
    body = (await request.json()) as FeedForwardRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !body.submission) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Safe fallback so the demo path always works locally.
  if (!apiKey) {
    return NextResponse.json({ ...demoReport(body), demo: true });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(body) }],
    });

    const firstBlock = response.content[0];
    const raw = firstBlock?.type === "text" ? firstBlock.text : "";
    const parsed = parseReport(raw);
    if (!parsed) {
      return NextResponse.json({ ...demoReport(body), demo: true });
    }
    return NextResponse.json(parsed);
  } catch {
    // Never block the founder's flow on an AI error — fall back to demo.
    return NextResponse.json({ ...demoReport(body), demo: true });
  }
}

function buildUserMessage(body: FeedForwardRequest): string {
  const { founderProfile, submission, moduleContext } = body;
  const sectionLines = (moduleContext.sections ?? []).map((s) => {
    const answer = (submission.sections[s.id] ?? "").trim();
    return `### ${s.prompt}\n${answer || "(left blank)"}`;
  });
  // If no section map was provided, fall back to raw entries.
  const fallbackLines =
    sectionLines.length > 0
      ? sectionLines
      : Object.entries(submission.sections).map(
          ([k, v]) => `### ${k}\n${(v || "").trim() || "(left blank)"}`,
        );

  return `FOUNDER VENTURE PROFILE
Venture: ${founderProfile.ventureName || "(unnamed)"}
Idea: ${founderProfile.idea || "(not provided)"}
Stage: ${founderProfile.stage || "(unknown)"}
Target customer: ${founderProfile.targetCustomer || "(not provided)"}
Current challenge: ${founderProfile.currentChallenge || "(not provided)"}
Goals: ${(founderProfile.goals ?? []).join("; ") || "(none listed)"}

MODULE: ${moduleContext.moduleTitle || "Effectuation Roadmap"}
ASSIGNMENT: ${moduleContext.assignmentTitle || "Build your Effectuation Roadmap"}

FOUNDER'S SUBMISSION
${fallbackLines.join("\n\n")}

Give feed-forward as instructed. Some sections may be blank or thin — note what's missing and encourage completion without grading.`;
}

function parseReport(raw: string): FeedForwardResult | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    return {
      strengths: toStringArray(obj.strengths),
      unclearAreas: toStringArray(obj.unclearAreas),
      unsupportedAssumptions: toStringArray(obj.unsupportedAssumptions),
      conceptConnections: toStringArray(obj.conceptConnections),
      mentorQuestions: toStringArray(obj.mentorQuestions),
      improvementSteps: toStringArray(obj.improvementSteps),
      nextAction: typeof obj.nextAction === "string" ? obj.nextAction : "",
      summary: typeof obj.summary === "string" ? obj.summary : "",
    };
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

// ── Demo fallback ────────────────────────────────────────────────────────────
function demoReport(body: FeedForwardRequest): FeedForwardResult {
  const venture = body.founderProfile.ventureName?.trim() || "your venture";
  const filled = Object.values(body.submission.sections).filter(
    (v) => (v || "").trim().length > 0,
  ).length;

  return {
    strengths: [
      `You've committed ${venture} to paper — that's the build-from-day-one move most people skip.`,
      "You started from your own means rather than waiting for outside resources.",
      filled >= 5
        ? "Your roadmap reaches across most sections, so a mentor can see the whole arc."
        : "There's a clear seed here to build the rest of the roadmap around.",
    ],
    unclearAreas: [
      "It's not yet clear who the very first customer is and why they'd say yes now.",
      "The link between your next experiment and a specific learning question could be sharper.",
    ],
    unsupportedAssumptions: [
      "You assume the target customer feels this problem strongly enough to act — that's a guess until you test it.",
      "Partnerships are named as helpful, but no concrete commitment has been asked for yet.",
    ],
    conceptConnections: [
      "Bird-in-hand: you're starting from who you are and what you know — keep leaning on that.",
      "Affordable loss: frame your next test by what you can survive losing, not the upside you hope for.",
      "Crazy-quilt: turn one 'helpful' contact into a real, committed partner.",
    ],
    mentorQuestions: [
      "What is the smallest real commitment you could ask a customer for this week?",
      "If your first experiment fails completely, what will you have learned that was worth it?",
      "Which box on your Business Model Canvas does this next move actually de-risk?",
    ],
    improvementSteps: [
      "Rewrite your next experiment as a single test with one clear question and a capped affordable loss.",
      "Name two people you could ask for a concrete commitment, and what you'd ask each for.",
      "Tie one insight explicitly to a customer segment or value proposition on your canvas.",
    ],
    nextAction: `This week, run one affordable-loss experiment for ${venture}: pick the cheapest test that puts you in front of a real potential customer, and write down the single question it answers.`,
    summary: `Strong start, founder — ${venture} is moving from idea to action. Tighten one experiment, ask for one real commitment, and you'll be ready for mentor review.`,
  };
}
