/**
 * Unknown Knowledge Brain — curated knowledge base for the Effectuation Roadmap
 * module (Phase DU-1A).
 *
 * This is intentionally structured as an array of self-contained, retrievable
 * "chunks" (KnowledgeConcept). Each concept stands alone with its own prose
 * fields and a source label, so a future RAG / vector layer can embed and
 * retrieve these without reshaping the data — swap `EFFECTUATION_CONCEPTS` for a
 * `retrieveConcepts(query)` call and the rest of the app is unaffected.
 *
 * Inspired by Saras Sarasvathy's effectuation research and an Unknown
 * University-style, build-from-day-one founder philosophy. No protected brand
 * assets are reproduced — only public entrepreneurship principles, re-voiced.
 */

import type {
  KnowledgeConcept,
  ModuleDefinition,
  ProgramDefinition,
} from "@/lib/du/types";

export const EFFECTUATION_CONCEPTS: KnowledgeConcept[] = [
  {
    id: "effectuation",
    title: "Effectuation",
    summary:
      "A logic of expert entrepreneurs: instead of predicting the future, you start with what you have and co-create the future through action and commitments.",
    unknownStyleInterpretation:
      "You don't need permission, a perfect plan, or a finished product to begin. Founders build forward from day one — one real action at a time — and let the venture take shape as the world responds.",
    founderApplication:
      "Stop waiting for certainty about your market. List what you can do this week with the means you already have, and ship one small thing that puts you in contact with a real customer.",
    commonMistakes: [
      "Treating a business plan as proof instead of a hypothesis",
      "Waiting for the 'right time' or full funding before acting",
      "Optimising a forecast no one can actually predict",
    ],
    mentorQuestions: [
      "What can you do this week that doesn't depend on anyone giving you permission?",
      "Which of your assumptions could be tested with a real action instead of more research?",
    ],
    sourceLabel: "Effectuation — Sarasvathy (principle overview)",
  },
  {
    id: "bird-in-hand",
    title: "Start with your means (Bird-in-hand)",
    summary:
      "Begin from your existing means — who you are, what you know, and who you know — rather than from a predefined goal you then chase resources to fund.",
    unknownStyleInterpretation:
      "Your unfair advantage is already in the room: your identity, your skills, and your network. The first move of a founder is to inventory those means, not to fundraise against a fantasy.",
    founderApplication:
      "Write three lists for your venture: who you are (identity, passions), what you know (skills, expertise), and who you know (network). Your first experiment should use at least one item from each list.",
    commonMistakes: [
      "Defining the venture by a goal that requires means you don't have yet",
      "Ignoring an existing network that could open the first door",
      "Underrating your own domain experience as a starting asset",
    ],
    mentorQuestions: [
      "What do you already have that a competitor would have to spend months building?",
      "Who in your network could you talk to this week about this problem?",
    ],
    sourceLabel: "Effectuation — Bird-in-hand principle",
  },
  {
    id: "affordable-loss",
    title: "Affordable loss",
    summary:
      "Decide how much you can afford to lose — time, money, reputation — and invest only that, rather than chasing expected returns you can't predict.",
    unknownStyleInterpretation:
      "Founders don't bet the farm to learn one thing. You cap the downside, run the experiment, and keep the option to play again. Cheap, fast learning beats an expensive, slow plan.",
    founderApplication:
      "For your next experiment, name the most you're willing to lose this month in money and hours. Design the test so that even a total failure stays inside that limit — and tells you something.",
    commonMistakes: [
      "Sizing investment by hoped-for upside instead of survivable downside",
      "Running one giant test instead of several cheap ones",
      "Not defining what 'a loss' even looks like before starting",
    ],
    mentorQuestions: [
      "What's the most you can afford to lose on this experiment without sinking the venture?",
      "If this test fails completely, what will you have learned that was worth the cost?",
    ],
    sourceLabel: "Effectuation — Affordable loss principle",
  },
  {
    id: "crazy-quilt",
    title: "Partnerships and co-creation (Crazy-quilt)",
    summary:
      "Build the venture with self-selected stakeholders who commit early. Each commitment reduces uncertainty and reshapes what the venture becomes.",
    unknownStyleInterpretation:
      "You don't compete your way to a market — you stitch one together. Early partners, customers, and collaborators aren't a distribution channel bolted on later; they co-author the product with you.",
    founderApplication:
      "Identify two or three people or organisations who could commit something real (time, intros, a pilot, pre-orders). Ask for a concrete commitment, and let what they offer shape your next step.",
    commonMistakes: [
      "Treating partners as vendors instead of co-creators",
      "Protecting the idea in secret instead of building shared commitment",
      "Chasing big-name logos before earning a single real commitment",
    ],
    mentorQuestions: [
      "Who could you bring in as a committed partner rather than just a customer?",
      "What is the smallest real commitment you could ask someone for this week?",
    ],
    sourceLabel: "Effectuation — Crazy-quilt principle",
  },
  {
    id: "lemonade",
    title: "Surprises as input (Lemonade principle)",
    summary:
      "Treat surprises and contingencies as fuel. Instead of avoiding the unexpected, leverage it — many strong ventures pivot into what they found, not what they planned.",
    unknownStyleInterpretation:
      "Step into the Unknown and the Unknown answers back. The detours, the 'wrong' customers, the odd requests — that's signal. Founders harvest surprises instead of forcing the original plan.",
    founderApplication:
      "Look back at one surprising piece of feedback or an unexpected user. What is it telling you? Design a small experiment that leans into that surprise rather than ignoring it.",
    commonMistakes: [
      "Discarding off-plan signals because they weren't in the roadmap",
      "Forcing the original idea when the market keeps pointing elsewhere",
      "Mistaking the first plan for the mission",
    ],
    mentorQuestions: [
      "What has surprised you most since you started — and what might it be telling you?",
      "Where is the market pulling you that your plan didn't predict?",
    ],
    sourceLabel: "Effectuation — Lemonade principle",
  },
  {
    id: "pilot-in-the-plane",
    title: "Agency (Pilot-in-the-plane)",
    summary:
      "The future is made, not found. Focus on the controllable — your actions and commitments — rather than trying to predict an unpredictable market.",
    unknownStyleInterpretation:
      "You are the pilot, not a passenger waiting on a forecast. Founders trade prediction for agency: 'to the extent we can control the future, we don't need to predict it.'",
    founderApplication:
      "List what is genuinely in your control this week versus what you're waiting on. Move one controllable thing forward today instead of waiting for an external signal.",
    commonMistakes: [
      "Outsourcing the venture's fate to market timing or luck",
      "Confusing busywork with controllable, venture-moving action",
      "Waiting on validation before taking any action you fully control",
    ],
    mentorQuestions: [
      "What is fully within your control this week — and are you actually doing it?",
      "Where are you waiting on the world when you could be acting instead?",
    ],
    sourceLabel: "Effectuation — Pilot-in-the-plane principle",
  },
  {
    id: "bmc-connection",
    title: "Connect to the Business Model Canvas",
    summary:
      "Effectuation gives you the moves; the Business Model Canvas gives you the board. Map what you learn into customer segments, value proposition, channels, and revenue.",
    unknownStyleInterpretation:
      "Your roadmap isn't a diary — it feeds a model. Every affordable-loss experiment and every partner commitment should sharpen a specific box on your canvas, turning action into a clearer business model.",
    founderApplication:
      "Take one insight from your means or an experiment and place it on the canvas: which customer segment, which value proposition, which channel does it change? Note what's still a guess.",
    commonMistakes: [
      "Filling the canvas with aspirations instead of evidence from experiments",
      "Never connecting day-to-day actions to the business model",
      "Treating the canvas as a one-time document instead of a living map",
    ],
    mentorQuestions: [
      "Which box on your Business Model Canvas does your next experiment actually de-risk?",
      "Where on the canvas are you still guessing rather than showing evidence?",
    ],
    sourceLabel: "Business Model Canvas — Osterwalder (effectuation linkage)",
  },
  {
    id: "founder-roadmap",
    title: "Build your first roadmap",
    summary:
      "An effectual roadmap is a sequence of cheap, controllable experiments — each starting from your means, capped by affordable loss, and open to surprise.",
    unknownStyleInterpretation:
      "This is the build-from-day-one artifact: not a 12-month Gantt chart, but the next two or three real moves and what each one is designed to teach you. Direction over prediction.",
    founderApplication:
      "Draft your next three experiments. For each: what means it uses, the affordable loss, the partner or customer it touches, and the one question it answers. That's your roadmap.",
    commonMistakes: [
      "Planning twelve months of certainty instead of three real experiments",
      "Listing tasks with no learning question attached",
      "Building a roadmap that needs resources you don't yet have",
    ],
    mentorQuestions: [
      "What are the next three experiments, and what does each one teach you?",
      "If you could only run one of them this week, which moves the venture most?",
    ],
    sourceLabel: "Effectuation — applied founder roadmap",
  },
];

export function getConcept(id: string): KnowledgeConcept | undefined {
  return EFFECTUATION_CONCEPTS.find((c) => c.id === id);
}

export function getConcepts(ids: string[]): KnowledgeConcept[] {
  return ids
    .map((id) => getConcept(id))
    .filter((c): c is KnowledgeConcept => Boolean(c));
}

// ── Program + module map ─────────────────────────────────────────────────────
export const ENTREPRENEURSHIP_PROGRAM: ProgramDefinition = {
  id: "entrepreneurship-foundations",
  title: "Entrepreneurship Foundations",
  tagline:
    "A digital university path for founders — learn by building your own venture, module by module.",
  modules: [
    {
      id: "effectuation",
      title: "Effectuation Roadmap",
      tagline: "Start from your means and build forward through real experiments.",
      status: "active",
    },
    {
      id: "business-model-canvas",
      title: "Business Model Canvas",
      tagline: "Map your venture into a coherent, testable business model.",
      status: "locked",
    },
    {
      id: "customer-discovery",
      title: "Customer Discovery",
      tagline: "Get out of the building and talk to real customers.",
      status: "locked",
    },
    {
      id: "branding",
      title: "Branding",
      tagline: "Give your venture a voice founders and customers remember.",
      status: "locked",
    },
    {
      id: "lean-pricing",
      title: "Lean Pricing",
      tagline: "Find a price the market will actually pay.",
      status: "locked",
    },
    {
      id: "pitching",
      title: "Pitching",
      tagline: "Tell the story of your venture with conviction.",
      status: "locked",
    },
    {
      id: "reflection-final-presentation",
      title: "Reflection & Final Presentation",
      tagline: "Synthesise the journey and present what you built.",
      status: "locked",
    },
  ],
};

export const EFFECTUATION_MODULE: ModuleDefinition = {
  id: "effectuation",
  programId: "entrepreneurship-foundations",
  title: "Effectuation Roadmap",
  tagline:
    "Stop predicting. Start building. Turn what you already have into your venture's first real roadmap.",
  status: "active",
  willLearn: [
    "How expert founders reason — effectuation over prediction",
    "Starting from your means: who you are, what you know, who you know",
    "Affordable loss as a way to size every bet",
    "Co-creating the venture through early partnerships",
    "Treating surprises as input, not failure",
    "Connecting your moves to the Business Model Canvas",
  ],
  willBuild: [
    "A venture profile that the whole module reasons about",
    "An Effectuation Roadmap: your next real experiments",
    "A feed-forward report you can act on before mentor review",
  ],
  steps: [
    { id: "welcome", order: 1, title: "Welcome to the module" },
    { id: "what-is-effectuation", order: 2, title: "What is effectuation?" },
    { id: "start-with-means", order: 3, title: "Start with your means" },
    { id: "affordable-loss", order: 4, title: "Affordable loss" },
    { id: "partnerships", order: 5, title: "Partnerships and co-creation" },
    { id: "surprises", order: 6, title: "Surprises as input" },
    { id: "bmc-connection", order: 7, title: "Connect to the Business Model Canvas" },
    { id: "build-roadmap", order: 8, title: "Build your first roadmap" },
    { id: "submit", order: 9, title: "Submit for feed-forward" },
    { id: "reflect", order: 10, title: "Reflect and prepare for mentor review" },
  ],
  // Concepts taught in the Learn flow (in order).
  conceptIds: [
    "bird-in-hand",
    "affordable-loss",
    "crazy-quilt",
    "lemonade",
    "pilot-in-the-plane",
    "bmc-connection",
  ],
  assignmentTitle: "Build your Effectuation Roadmap",
  assignmentSections: [
    {
      id: "who-are-you",
      prompt: "Who are you?",
      helper: "Your identity, passions, and why this venture is yours to build.",
    },
    {
      id: "what-you-know",
      prompt: "What do you know?",
      helper: "Skills, expertise, and hard-won knowledge you can start from.",
    },
    {
      id: "who-you-know",
      prompt: "Who do you know?",
      helper: "Networks and people who could open the first real door.",
    },
    {
      id: "affordable-loss",
      prompt: "What can you test with affordable loss?",
      helper: "An experiment whose downside you can survive — and what it teaches.",
    },
    {
      id: "partnerships",
      prompt: "Which partnerships could help?",
      helper: "Who could commit something real and co-create with you?",
    },
    {
      id: "bmc-connection",
      prompt: "How does this connect to your Business Model Canvas?",
      helper: "Which segment, value proposition, or channel does this sharpen?",
    },
    {
      id: "next-experiment",
      prompt: "What is your next experiment?",
      helper: "The single next move and the one question it answers.",
    },
  ],
};

export const EFFECTUATION_SECTION_IDS = EFFECTUATION_MODULE.assignmentSections.map(
  (s) => s.id,
);
