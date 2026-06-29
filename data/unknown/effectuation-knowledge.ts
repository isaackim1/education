/**
 * Unknown Knowledge Brain — local source/chunk store for the Effectuation
 * Roadmap module (Phase 3, local RAG layer).
 *
 * This is the Content Brain that grounds the AI Mentor and Feed-Forward Brain in
 * Unknown-style entrepreneurship knowledge. It is deliberately structured like a
 * real retrieval corpus:
 *
 *   KnowledgeSource  →  a document (a clip, a module note, assignment criteria…)
 *   KnowledgeChunk   →  a retrievable passage inside that document
 *
 * IMPORTANT — these are curated, PARAPHRASED module notes, not verbatim
 * transcripts. Nothing here is presented as an exact quote. The shape is ready
 * for real transcripts + embeddings later: add `sourceUrl`/`author` to a source,
 * drop in transcript chunks, and add an `embedding` field — the retrieval API in
 * lib/du/knowledge.ts stays the same.
 *
 * Inspired by Sarasvathy's effectuation research and an Unknown University-style,
 * build-from-day-one founder philosophy. No protected brand assets are
 * reproduced — only public entrepreneurship principles, re-voiced.
 */

import type { KnowledgeChunk, KnowledgeSource } from "@/lib/du/types";

const MODULE_ID = "effectuation";

// ── Sources ──────────────────────────────────────────────────────────────────
export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    id: "src-effectuation-clip",
    title: "Effectuation Knowledge Clip",
    type: "knowledge_clip",
    sourceLabel: "Effectuation Knowledge Clip",
  },
  {
    id: "src-effectuators-roadmap",
    title: "Effectuators Roadmap",
    type: "module_note",
    sourceLabel: "Effectuators Roadmap",
  },
  {
    id: "src-module-note",
    title: "Unknown Digital University Module Note",
    type: "module_note",
    sourceLabel: "Unknown Digital University Module Note",
  },
  {
    id: "src-assignment-criteria",
    title: "Effectuation Roadmap Assignment Criteria",
    type: "assignment_criteria",
    sourceLabel: "Effectuation Roadmap Assignment Criteria",
  },
  {
    id: "src-philosophy",
    title: "Unknown Entrepreneurship Philosophy",
    type: "philosophy_note",
    sourceLabel: "Unknown Entrepreneurship Philosophy",
  },
];

const SOURCE_LABEL: Record<string, string> = Object.fromEntries(
  KNOWLEDGE_SOURCES.map((s) => [s.id, s.sourceLabel]),
);

/** Small helper so each chunk literal stays readable (denormalises the label). */
function chunk(
  c: Omit<KnowledgeChunk, "moduleId" | "sourceLabel"> &
    Partial<Pick<KnowledgeChunk, "moduleId" | "sourceLabel">>,
): KnowledgeChunk {
  return {
    ...c,
    moduleId: c.moduleId ?? MODULE_ID,
    sourceLabel: c.sourceLabel ?? SOURCE_LABEL[c.sourceId] ?? "Unknown source",
  };
}

// ── Chunks ───────────────────────────────────────────────────────────────────
export const EFFECTUATION_KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  chunk({
    id: "kc-effectuation-overview",
    sourceId: "src-effectuation-clip",
    title: "What effectuation is",
    summary:
      "Effectuation is the logic expert founders use: build forward from what you have instead of predicting and planning the future.",
    content:
      "Effectuation flips the predictive logic most people are taught. Rather than set a fixed goal and then gather the resources to reach it, effectual founders start from their means and let goals emerge through action and commitments. The future isn't forecast — it's made, one real step at a time. For an alpha-stage founder this means trading 'what's the perfect plan?' for 'what can I actually do this week with what I already have?'",
    conceptIds: ["effectuation"],
    tags: ["effectuation", "logic", "prediction", "action", "overview"],
    useCases: ["mentor", "feedforward", "lesson"],
    order: 1,
  }),
  chunk({
    id: "kc-bird-in-hand",
    sourceId: "src-effectuation-clip",
    title: "Start with your means (Bird-in-hand)",
    summary:
      "Begin from who you are, what you know, and who you know — not from a goal that requires means you don't yet have.",
    content:
      "The bird-in-hand principle says your first move is to inventory your means: identity (who you are), knowledge (what you know), and network (who you know). Strong ventures are built from these existing assets rather than from a fantasy that needs outside funding before anything can start. A good first experiment uses at least one means from each list, turning what you already have into momentum.",
    conceptIds: ["bird-in-hand"],
    tags: ["means", "bird-in-hand", "identity", "network", "skills", "who-you-know"],
    useCases: ["mentor", "feedforward", "lesson", "assignment_review"],
    order: 2,
  }),
  chunk({
    id: "kc-affordable-loss",
    sourceId: "src-effectuation-clip",
    title: "Affordable loss",
    summary:
      "Size each bet by what you can afford to lose, not by the upside you hope for. Cap the downside and keep playing.",
    content:
      "Affordable loss replaces 'expected return' as the way founders decide how much to commit. Decide up front the most you're willing to lose — in money, hours, and reputation — and design the experiment to stay inside that limit. Even a total failure should leave the venture standing and teach one specific thing. This is how founders run many cheap, fast experiments instead of one slow, expensive bet.",
    conceptIds: ["affordable-loss"],
    tags: ["affordable-loss", "experiment", "risk", "downside", "test", "validation"],
    useCases: ["mentor", "feedforward", "lesson", "assignment_review"],
    order: 3,
  }),
  chunk({
    id: "kc-crazy-quilt",
    sourceId: "src-effectuation-clip",
    title: "Partnerships and co-creation (Crazy-quilt)",
    summary:
      "Build the venture with self-selected partners who commit early; each real commitment reshapes what the venture becomes.",
    content:
      "The crazy-quilt principle treats early stakeholders as co-creators, not vendors or a distribution channel bolted on later. Founders stitch a market together through real commitments — a pilot, intros, pre-orders, time. The skill is asking for the smallest real commitment someone will actually make, then letting what they offer shape the next step rather than guarding the idea in secret.",
    conceptIds: ["crazy-quilt"],
    tags: ["partnerships", "crazy-quilt", "co-creation", "commitment", "stakeholders"],
    useCases: ["mentor", "feedforward", "lesson", "assignment_review"],
    order: 4,
  }),
  chunk({
    id: "kc-lemonade",
    sourceId: "src-effectuation-clip",
    title: "Surprises as input (Lemonade principle)",
    summary:
      "Treat surprises and contingencies as fuel. Many strong ventures pivot into what they found, not what they planned.",
    content:
      "The lemonade principle says the unexpected is signal, not noise. Off-plan feedback, the 'wrong' customers, and odd requests often point to where the real opportunity lives. Effectual founders lean into surprises and design a small experiment around them instead of forcing the original plan. Stepping into the Unknown means letting the Unknown answer back.",
    conceptIds: ["lemonade"],
    tags: ["surprises", "lemonade", "contingency", "pivot", "feedback", "signal"],
    useCases: ["mentor", "feedforward", "lesson"],
    order: 5,
  }),
  chunk({
    id: "kc-pilot-in-the-plane",
    sourceId: "src-effectuation-clip",
    title: "Agency (Pilot-in-the-plane)",
    summary:
      "Focus on the controllable. To the extent you can control the future, you don't need to predict it.",
    content:
      "The pilot-in-the-plane principle centres human agency: the future is made through the actions and commitments you control, not found through forecasts. Founders list what is genuinely in their control this week versus what they're waiting on, then move one controllable thing forward. It's the antidote to outsourcing the venture's fate to market timing or luck.",
    conceptIds: ["pilot-in-the-plane"],
    tags: ["agency", "pilot-in-the-plane", "control", "action", "ownership"],
    useCases: ["mentor", "feedforward", "lesson"],
    order: 6,
  }),
  chunk({
    id: "kc-effectuators-roadmap",
    sourceId: "src-effectuators-roadmap",
    title: "The effectuators roadmap",
    summary:
      "An effectual roadmap is a short sequence of cheap, controllable experiments — each starting from means, capped by affordable loss, open to surprise.",
    content:
      "The Effectuators Roadmap is the build-from-day-one artifact this module produces: not a twelve-month Gantt chart but the next two or three real moves and what each one is designed to teach. For every step, name the means it uses, the affordable loss, the customer or partner it touches, and the single question it answers. Direction over prediction — the roadmap sharpens every time a step gets a clear learning question attached to it.",
    conceptIds: ["founder-roadmap", "effectuation"],
    tags: ["roadmap", "experiments", "next-steps", "learning-question", "plan"],
    useCases: ["mentor", "feedforward", "lesson", "assignment_review"],
    order: 7,
  }),
  chunk({
    id: "kc-bmc-connection",
    sourceId: "src-module-note",
    title: "Connecting effectuation to the Business Model Canvas",
    summary:
      "Effectuation gives the moves; the Business Model Canvas gives the board. Map each experiment to a specific canvas box.",
    content:
      "A roadmap isn't a diary — it feeds a model. Every affordable-loss experiment and every partner commitment should sharpen a specific box on the Business Model Canvas: which customer segment, which value proposition, which channel does it change? Founders are pushed to mark what is still a guess versus what now has evidence, so the canvas stays a living map rather than a one-time aspiration.",
    conceptIds: ["bmc-connection"],
    tags: [
      "business-model-canvas",
      "bmc",
      "customer-segment",
      "value-proposition",
      "channel",
      "evidence",
    ],
    useCases: ["mentor", "feedforward", "assignment_review"],
    order: 8,
  }),
  chunk({
    id: "kc-applied-learning",
    sourceId: "src-philosophy",
    title: "Applied learning — build from day one",
    summary:
      "Unknown-style learning is applied, not theoretical: founders learn by doing real work on their own venture, not by passing exams.",
    content:
      "The Unknown philosophy is that founders learn by building. There are no grades, no quizzes, and no passive consumption — every concept is pushed onto the founder's actual venture and turned into a concrete next action. Progress is measured by what you've built and tested, not by what you can recite. 'Build from day one' is the operating instruction, not a slogan.",
    conceptIds: ["effectuation"],
    tags: ["applied-learning", "build-from-day-one", "philosophy", "doing", "no-grades"],
    useCases: ["mentor", "lesson"],
    order: 9,
  }),
  chunk({
    id: "kc-feed-forward",
    sourceId: "src-module-note",
    title: "Feed-forward, not grading",
    summary:
      "Feed-forward is forward-looking and never a grade: it says what to build next, not what was wrong, and never replaces a human mentor.",
    content:
      "Feed-forward is the module's core assessment idea. It gives no score, no pass/fail, and no ranking. Instead it names strengths, surfaces unclear areas and unsupported assumptions, connects the work to module concepts, and ends on one concrete next action. It is explicitly a complement to — never a replacement for — a human mentor review. The tone is direct and founder-to-founder, focused on momentum.",
    conceptIds: ["effectuation"],
    tags: ["feed-forward", "feedforward", "assessment", "no-grading", "next-action"],
    useCases: ["feedforward", "mentor"],
    order: 10,
  }),
  chunk({
    id: "kc-mentor-review-prep",
    sourceId: "src-module-note",
    title: "Preparing for mentor review",
    summary:
      "Walk into a human mentor review further along: clear first customer, an affordable-loss test, one real partner ask, and the assumptions you most need challenged.",
    content:
      "Mentor review preparation means arriving with evidence or a clear plan to get it — not a polished plan with no test behind it. The strongest preparation makes three things crisp: who the first customer is and why they'd say yes now, what will be tested with affordable loss, and which partnership will actually be asked to commit. A sharp mentor pushes hardest on unproven assumptions, so the founder should bring the assumption they most need a second opinion on.",
    conceptIds: ["bird-in-hand", "affordable-loss", "crazy-quilt"],
    tags: [
      "mentor-review",
      "preparation",
      "readiness",
      "assumptions",
      "first-customer",
    ],
    useCases: ["mentor", "feedforward"],
    order: 11,
  }),
  chunk({
    id: "kc-common-mistakes",
    sourceId: "src-philosophy",
    title: "Common founder mistakes in this module",
    summary:
      "The usual traps: treating the plan as proof, waiting for certainty, sizing bets by upside, guarding the idea, and ignoring off-plan signals.",
    content:
      "Recurring founder mistakes this module watches for: treating a business plan as proof instead of a hypothesis; waiting for the 'right time' or full funding before acting; sizing investment by hoped-for upside rather than survivable downside; protecting the idea in secret instead of building shared commitment; listing tasks with no learning question attached; and discarding surprising signals because they weren't in the roadmap. Naming these early keeps feed-forward concrete.",
    conceptIds: [
      "effectuation",
      "affordable-loss",
      "crazy-quilt",
      "lemonade",
    ],
    tags: ["common-mistakes", "pitfalls", "assumptions", "mistakes", "traps"],
    useCases: ["feedforward", "mentor", "assignment_review"],
    order: 12,
  }),
  chunk({
    id: "kc-assignment-criteria",
    sourceId: "src-assignment-criteria",
    title: "Effectuation Roadmap assignment criteria",
    summary:
      "A strong roadmap covers means (who you are/know/know), an affordable-loss test, a real partnership ask, a canvas connection, and a single next experiment with a clear question.",
    content:
      "The Effectuation Roadmap assignment asks the founder to apply the principles to their own venture across seven sections: who are you, what do you know, who do you know, what can you test with affordable loss, which partnerships could help, how this connects to the Business Model Canvas, and what the next experiment is. Strong work is specific and grounded in the founder's real means; it names a concrete affordable-loss test, asks for a real commitment from a named partner, ties at least one insight to a canvas box, and ends with a single next experiment that has one clear learning question. Thin or generic answers, untested assumptions, and experiments with no question attached are the main things to sharpen.",
    conceptIds: [
      "bird-in-hand",
      "affordable-loss",
      "crazy-quilt",
      "bmc-connection",
      "founder-roadmap",
    ],
    tags: [
      "assignment-criteria",
      "rubric",
      "roadmap",
      "sections",
      "requirements",
      "what-good-looks-like",
    ],
    useCases: ["feedforward", "assignment_review"],
    order: 13,
  }),
];
