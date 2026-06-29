/**
 * Unknown Digital University — founder onboarding / demo seed (Phase 2).
 *
 * A one-click "Use demo venture" payload so a partner demo can jump straight
 * into a fully populated Effectuation Roadmap. Data-only constants here, plus a
 * storage-writing `seedDemoVenture()` for entry points that have no form to
 * fill (e.g. the campus onboarding card).
 */

import {
  duGenerateId,
  nowIso,
  saveFounderProfile,
  saveFounderState,
  saveSubmission,
} from "./storage";
import { createInitialFounderState, EFFECTUATION_MODULE_ID } from "./progress";
import type {
  AssignmentSubmission,
  FounderProfile,
  VentureStage,
} from "./types";

export interface DemoVentureInput {
  ventureName: string;
  idea: string;
  stage: VentureStage;
  targetCustomer: string;
  currentChallenge: string;
  goals: string[];
}

export const DEMO_VENTURE: DemoVentureInput = {
  ventureName: "Ivvy",
  idea: "An AI learning coach that helps students and founders learn by doing, not by passively consuming content.",
  stage: "validation",
  targetCustomer: "entrepreneurship students and early founders",
  currentChallenge:
    "proving that the digital university experience creates better progress before human mentor sessions",
  goals: [
    "test with Unknown University-style students",
    "validate feed-forward usefulness",
    "turn one module into a complete digital learning journey",
  ],
};

/**
 * Strong, demo-ready answers for the Effectuation Roadmap assignment — keyed by
 * the module's assignment section ids. Gives feed-forward real substance to work
 * with so the demo lands.
 */
export const DEMO_SECTIONS: Record<string, string> = {
  "who-are-you":
    "I'm a builder who learns fastest by shipping. I've coached students through exam prep and watched passive content fail them — so I care about applied, build-from-day-one learning. Ivvy is mine to build because I've lived the problem from both sides: learner and coach.",
  "what-you-know":
    "I know how to turn messy material into structured learning, how to design feed-forward that changes behaviour, and how to ship a working product with a small team. I understand LLM-backed coaching and what makes founders actually act versus nod along.",
  "who-you-know":
    "I know entrepreneurship educators, a few Unknown University-style program leads, and a network of early founders who'll trial new tools. I can reach roughly a dozen students and two program coordinators this week without any cold outreach.",
  "affordable-loss":
    "I can afford to lose one week and a small amount of credits running one cohort of 8 founders through the Effectuation module. If it flops, I've lost a week and learned exactly where the journey breaks — not the company.",
  partnerships:
    "An Unknown University-style program could co-run a pilot where their students use Ivvy before human mentor sessions. The concrete ask: one program coordinator commits 8 students and one mentor's time to compare prepared vs unprepared sessions.",
  "bmc-connection":
    "This sharpens the customer segment (program-backed founders, not solo self-learners) and the value proposition (founders arrive at mentor sessions further along). Channel becomes the university itself rather than direct-to-founder marketing.",
  "next-experiment":
    "Run one 8-founder cohort through the Effectuation module this week and measure whether mentors rate those sessions as more prepared. The single question: does Ivvy's feed-forward measurably improve readiness before a human mentor session?",
};

/**
 * Persist the demo venture (profile + submission + initial journey state) and
 * return the created profile. Used by entry points without an editable form.
 */
export function seedDemoVenture(): FounderProfile {
  const now = nowIso();
  const profile: FounderProfile = {
    id: duGenerateId(),
    ventureName: DEMO_VENTURE.ventureName,
    idea: DEMO_VENTURE.idea,
    stage: DEMO_VENTURE.stage,
    targetCustomer: DEMO_VENTURE.targetCustomer,
    currentChallenge: DEMO_VENTURE.currentChallenge,
    goals: [...DEMO_VENTURE.goals],
    createdAt: now,
    updatedAt: now,
  };
  saveFounderProfile(profile);

  const submission: AssignmentSubmission = {
    id: duGenerateId(),
    moduleId: EFFECTUATION_MODULE_ID,
    founderProfileId: profile.id,
    sections: { ...DEMO_SECTIONS },
    createdAt: now,
    updatedAt: now,
  };
  saveSubmission(submission);

  saveFounderState({
    ...createInitialFounderState(profile.id),
    progressState: "applying_to_venture",
    currentStepId: "build-roadmap",
    nextRecommendedAction:
      "Generate feed-forward on your Effectuation Roadmap to see what to sharpen before mentor review.",
  });

  return profile;
}
