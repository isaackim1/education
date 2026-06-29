import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { MentorResult } from "@/lib/du/types";

/**
 * Unknown AI Mentor (Phase DU-1A) — the re-cast of Ivvy's Coach Brain.
 *
 * A 24/7 founder coach inside the digital university. Module- and venture-aware.
 * Same provider/model/env conventions as app/api/agent/route.ts. Falls back to a
 * useful demo reply when no API key is configured so the chat always responds.
 */

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

interface MentorRequest {
  message: string;
  history?: { role: "founder" | "mentor"; content: string }[];
  /** Alias for `history` — recent persisted thread messages, if provided. */
  recentMessages?: { role: "founder" | "mentor"; content: string }[];
  founderProfile?: {
    ventureName?: string;
    idea?: string;
    stage?: string;
    targetCustomer?: string;
    currentChallenge?: string;
    goals?: string[];
  };
  currentModule?: { title?: string; tagline?: string };
  currentStep?: { title?: string };
  latestFeedForwardReport?: {
    summary?: string;
    nextAction?: string;
    unsupportedAssumptions?: string[];
    mentorQuestions?: string[];
  };
}

const SYSTEM_PROMPT = `You are the Unknown AI Mentor inside Unknown Digital University — a 24/7 founder coach in a digital entrepreneurship campus.

Who you are:
- A sharp, direct, encouraging founder coach. Not a generic chatbot, not a customer-support bot.
- You do NOT pretend to be a human professor. If asked, you're the always-on AI mentor that complements human mentor reviews.

Hard rules:
- No legal, financial, tax, or investment advice. No guarantees of business success or fundraising outcomes.
- No generic startup platitudes. Every reply is specific to THIS founder's venture and current module.

How you coach:
- Use the founder's venture context and the current module context in every answer.
- This is an ongoing relationship: reference earlier parts of THIS conversation when relevant ("last time you said…", "building on the experiment we discussed…") instead of restarting cold each turn. Don't repeat a suggestion you already made — advance it.
- When a feed-forward report is present, connect your coaching to it: its open assumptions, its suggested next action, and what the founder should change before a human mentor review.
- Connect advice to effectuation when relevant: start with your means (bird-in-hand), affordable loss, partnerships/co-creation (crazy-quilt), surprises as input (lemonade), agency (pilot-in-the-plane), and the Business Model Canvas link.
- Ask strong coaching questions that move the founder forward.
- Always push toward ONE concrete next practical action.
- Keep replies tight: a few short paragraphs or a short list, not an essay.

After your conversational reply, append a single line of machine-readable JSON on its own final line, in this exact form (no markdown fence):
<<META>>{"suggestedNextAction":"...","suggestedQuestion":"..."}
Both fields optional; omit a key if you have nothing strong. The <<META>> line is parsed out and never shown verbatim.`;

export async function POST(request: Request) {
  let body: MentorRequest;
  try {
    body = (await request.json()) as MentorRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ...demoReply(body), demo: true });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const priorMessages = body.history ?? body.recentMessages ?? [];
    const history = priorMessages.slice(-8).map((m) => ({
      role: m.role === "mentor" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildContext(body) },
        { role: "assistant", content: "Understood — I have the venture and module context." },
        ...stripLeadingAssistant(history),
        { role: "user", content: body.message.trim() },
      ],
    });

    const firstBlock = response.content[0];
    const raw = firstBlock?.type === "text" ? firstBlock.text : "";
    return NextResponse.json(parseMentor(raw, body));
  } catch {
    return NextResponse.json({ ...demoReply(body), demo: true });
  }
}

function buildContext(body: MentorRequest): string {
  const p = body.founderProfile ?? {};
  const ff = body.latestFeedForwardReport;
  const lines = [
    "CONTEXT FOR THIS COACHING SESSION",
    `Venture: ${p.ventureName || "(not set up yet)"}`,
    `Idea: ${p.idea || "(not provided)"}`,
    `Stage: ${p.stage || "(unknown)"}`,
    `Target customer: ${p.targetCustomer || "(not provided)"}`,
    `Current challenge: ${p.currentChallenge || "(not provided)"}`,
    `Goals: ${(p.goals ?? []).join("; ") || "(none listed)"}`,
    `Current module: ${body.currentModule?.title || "Effectuation Roadmap"} — ${
      body.currentModule?.tagline || ""
    }`,
    `Current step: ${body.currentStep?.title || "(in progress)"}`,
  ];
  if (ff) {
    lines.push(
      "",
      "MOST RECENT FEED-FORWARD",
      `Summary: ${ff.summary || "(none)"}`,
      `Suggested next action: ${ff.nextAction || "(none)"}`,
      `Open assumptions to challenge: ${(ff.unsupportedAssumptions ?? []).join("; ") || "(none)"}`,
    );
  }
  return lines.join("\n");
}

function stripLeadingAssistant(
  history: { role: "user" | "assistant"; content: string }[],
): { role: "user" | "assistant"; content: string }[] {
  let out = history;
  while (out.length > 0 && out[0].role === "assistant") out = out.slice(1);
  return out;
}

function parseMentor(raw: string, body: MentorRequest): MentorResult {
  const metaIdx = raw.indexOf("<<META>>");
  let reply = raw;
  let meta: { suggestedNextAction?: string; suggestedQuestion?: string } = {};
  if (metaIdx !== -1) {
    reply = raw.slice(0, metaIdx).trim();
    const jsonStart = raw.indexOf("{", metaIdx);
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      try {
        meta = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      } catch {
        meta = {};
      }
    }
  }
  reply = reply.trim();
  if (!reply) return demoReply(body);
  return {
    reply,
    suggestedNextAction:
      typeof meta.suggestedNextAction === "string" && meta.suggestedNextAction.trim()
        ? meta.suggestedNextAction.trim()
        : undefined,
    suggestedQuestion:
      typeof meta.suggestedQuestion === "string" && meta.suggestedQuestion.trim()
        ? meta.suggestedQuestion.trim()
        : undefined,
  };
}

// ── Demo fallback ────────────────────────────────────────────────────────────
function demoReply(body: MentorRequest): MentorResult {
  const venture = body.founderProfile?.ventureName?.trim() || "your venture";
  const challenge = body.founderProfile?.currentChallenge?.trim();
  const msg = body.message.toLowerCase();

  let reply: string;
  if (msg.includes("assumption") || msg.includes("challenge")) {
    reply = `Let's pressure-test ${venture}. The biggest unproven assumption right now is that your target customer feels this problem strongly enough to change what they do today. That's a belief, not a fact — yet.\n\nPick the single assumption that, if wrong, breaks the venture. Then design the cheapest test that could prove you wrong this week. Effectuation calls this affordable loss: risk only what you can survive, and let the result redirect you.`;
  } else if (msg.includes("affordable loss")) {
    reply = `Affordable loss for ${venture} means deciding up front the most you're willing to lose — in hours and money — on your next move, then designing the test to stay inside that limit.\n\nDon't size the bet by the upside you hope for. Size it by the downside you can survive. Even a total failure should leave you standing and teach you one specific thing.`;
  } else if (msg.includes("roadmap")) {
    reply = `A strong Effectuation Roadmap for ${venture} isn't a 12-month plan — it's your next two or three real experiments. For each, name the means it uses, the affordable loss, the customer or partner it touches, and the one question it answers.\n\nRight now, your roadmap will get sharper the moment every step has a learning question attached to it.`;
  } else if (msg.includes("mentor review") || msg.includes("prepare")) {
    reply = `To be ready for mentor review, ${venture} needs three things crisp: who your first customer is, what you'll test with affordable loss, and which partnership you'll actually ask to commit. A mentor will push hardest on the assumptions you've left unproven.\n\nWalk in with evidence or a clear plan to get it — not a polished plan with no test behind it.`;
  } else if (msg.includes("week") || msg.includes("next")) {
    reply = `This week, move one controllable thing forward for ${venture}. You're the pilot in the plane — don't wait on the market to tell you it's time.\n\nThe highest-leverage move is usually the cheapest experiment that puts you in front of a real potential customer. Do that, write down what you learn, and bring it back here.`;
  } else {
    reply = `Good — let's build. ${venture} moves forward fastest when you start from your means: who you are, what you know, and who you know.${
      challenge ? ` You flagged "${challenge}" as your current challenge — that's exactly where to aim a small, affordable experiment.` : ""
    }\n\nTell me where you're stuck and I'll help you turn it into a concrete next test.`;
  }

  return {
    reply,
    suggestedNextAction: `Run one affordable-loss experiment for ${venture} this week and note the single question it answers.`,
    suggestedQuestion: "What's the smallest real commitment you could ask a customer for this week?",
  };
}
