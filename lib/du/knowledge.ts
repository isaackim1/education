/**
 * Unknown Knowledge Brain — local retrieval layer (Phase 3).
 *
 * A deterministic, dependency-free retrieval function over the curated
 * Effectuation knowledge chunks. It is intentionally simple and inspectable:
 * keyword overlap + tag/concept/use-case/module signals, with a feed-forward
 * boost for assignment criteria.
 *
 * This is the seam a real vector layer slots into later: keep
 * `retrieveKnowledge(query, options)` and `formatKnowledgeForPrompt(...)` as the
 * public contract, and swap the scorer for an embedding similarity search. The
 * rest of the app (API routes, UI) never has to change.
 *
 * If retrieval is weak or empty, callers can fall back to the curated concept
 * base (data/unknown/effectuation.ts) via `getFallbackKnowledge`.
 */

import {
  EFFECTUATION_KNOWLEDGE_CHUNKS,
  KNOWLEDGE_SOURCES,
} from "@/data/unknown/effectuation-knowledge";
import { EFFECTUATION_CONCEPTS } from "@/data/unknown/effectuation";
import type {
  KnowledgeChunk,
  KnowledgeUseCase,
  RetrievedKnowledge,
  SourceRef,
} from "./types";

// Assignment-criteria sources get a boost during feed-forward retrieval.
const ASSIGNMENT_CRITERIA_SOURCE_IDS = new Set(
  KNOWLEDGE_SOURCES.filter((s) => s.type === "assignment_criteria").map(
    (s) => s.id,
  ),
);

const STOPWORDS = new Set([
  "the", "and", "for", "with", "this", "that", "you", "your", "are", "was",
  "has", "have", "had", "but", "not", "can", "will", "would", "could", "should",
  "what", "who", "how", "why", "when", "which", "from", "into", "onto", "out",
  "about", "than", "then", "they", "them", "their", "our", "ours", "his", "her",
  "its", "it's", "a", "an", "of", "to", "in", "on", "at", "by", "is", "be", "as",
  "or", "if", "so", "do", "does", "did", "i", "we", "me", "my", "us",
]);

export interface RetrieveOptions {
  moduleId?: string;
  useCase?: KnowledgeUseCase;
  conceptIds?: string[];
  tags?: string[];
  limit?: number;
  /** Minimum score a chunk must reach to be returned. Default 2. */
  minScore?: number;
}

// ── Basic accessors ──────────────────────────────────────────────────────────
export function getAllKnowledgeChunks(): KnowledgeChunk[] {
  return EFFECTUATION_KNOWLEDGE_CHUNKS;
}

export function getKnowledgeByModule(moduleId: string): KnowledgeChunk[] {
  return EFFECTUATION_KNOWLEDGE_CHUNKS.filter((c) => c.moduleId === moduleId);
}

// ── Tokenisation ─────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function uniq(items: string[]): string[] {
  return Array.from(new Set(items));
}

// ── Retrieval ────────────────────────────────────────────────────────────────
/**
 * Score and rank knowledge chunks for a query. Deterministic: the same inputs
 * always yield the same ordering (ties broken by `order` then id).
 */
export function retrieveKnowledge(
  query: string,
  options: RetrieveOptions = {},
): RetrievedKnowledge[] {
  const {
    moduleId,
    useCase,
    conceptIds = [],
    tags = [],
    limit = 5,
    minScore = 2,
  } = options;

  const queryTokens = uniq(tokenize(query));
  const wantTags = tags.map((t) => t.toLowerCase());
  const wantConcepts = conceptIds.map((c) => c.toLowerCase());

  const scored: RetrievedKnowledge[] = [];

  for (const chunk of EFFECTUATION_KNOWLEDGE_CHUNKS) {
    // Hard module filter when requested.
    if (moduleId && chunk.moduleId !== moduleId) continue;

    const reasons: string[] = [];
    let score = 0;

    // 1. Keyword overlap against the chunk's searchable text.
    const haystack = uniq(
      tokenize(
        `${chunk.title} ${chunk.summary} ${chunk.content} ${chunk.tags.join(
          " ",
        )} ${chunk.conceptIds.join(" ")}`,
      ),
    );
    const haySet = new Set(haystack);
    const keywordHits = queryTokens.filter((t) => haySet.has(t));
    if (keywordHits.length > 0) {
      score += Math.min(keywordHits.length, 6) * 2;
      reasons.push(`keywords: ${keywordHits.slice(0, 4).join(", ")}`);
    }

    // 2. Explicit tag overlap.
    const chunkTags = new Set(chunk.tags.map((t) => t.toLowerCase()));
    const tagHits = wantTags.filter((t) => chunkTags.has(t));
    if (tagHits.length > 0) {
      score += tagHits.length * 3;
      reasons.push(`tags: ${tagHits.join(", ")}`);
    }

    // 3. Concept match (explicit ids, and query tokens that name a concept).
    const chunkConcepts = new Set(chunk.conceptIds.map((c) => c.toLowerCase()));
    const conceptHits = wantConcepts.filter((c) => chunkConcepts.has(c));
    const conceptTokenHits = queryTokens.filter((t) => chunkConcepts.has(t));
    const conceptTotal = conceptHits.length + conceptTokenHits.length;
    if (conceptTotal > 0) {
      score += conceptTotal * 4;
      reasons.push(
        `concepts: ${uniq([...conceptHits, ...conceptTokenHits]).join(", ")}`,
      );
    }

    // 4. Use-case match.
    if (useCase && chunk.useCases.includes(useCase)) {
      score += 3;
      reasons.push(`fits ${useCase}`);
    }

    // 5. Module match (soft signal when no hard filter narrowed it).
    if (moduleId && chunk.moduleId === moduleId) {
      score += 2;
    }

    // 6. Feed-forward boost for assignment criteria.
    if (
      useCase === "feedforward" &&
      ASSIGNMENT_CRITERIA_SOURCE_IDS.has(chunk.sourceId)
    ) {
      score += 4;
      reasons.push("assignment criteria");
    }

    if (score > 0) {
      scored.push({
        chunk,
        score,
        reason: reasons.join(" · ") || "module knowledge",
      });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ao = a.chunk.order ?? 999;
    const bo = b.chunk.order ?? 999;
    if (ao !== bo) return ao - bo;
    return a.chunk.id.localeCompare(b.chunk.id);
  });

  return scored.filter((r) => r.score >= minScore).slice(0, limit);
}

/**
 * Fallback to the curated concept base when chunk retrieval is weak/empty. Maps
 * the best-matching concepts into the same RetrievedKnowledge shape so callers
 * have a single code path.
 */
export function getFallbackKnowledge(
  query: string,
  limit = 3,
): RetrievedKnowledge[] {
  const queryTokens = uniq(tokenize(query));
  const scored = EFFECTUATION_CONCEPTS.map((concept) => {
    const hay = new Set(
      uniq(
        tokenize(
          `${concept.title} ${concept.summary} ${concept.unknownStyleInterpretation} ${concept.founderApplication}`,
        ),
      ),
    );
    let score = 0;
    for (const t of queryTokens) if (hay.has(t)) score += 1;

    const retrieved: RetrievedKnowledge = {
      chunk: {
        id: `concept-${concept.id}`,
        sourceId: "src-curated-concept",
        moduleId: "effectuation",
        title: concept.title,
        content: `${concept.summary} ${concept.unknownStyleInterpretation} ${concept.founderApplication}`,
        summary: concept.summary,
        conceptIds: [concept.id],
        tags: [concept.id],
        useCases: ["mentor", "feedforward", "lesson"],
        sourceLabel: concept.sourceLabel,
        order: undefined,
      },
      score,
      reason: "curated concept (fallback)",
    };
    return retrieved;
  });

  scored.sort((a, b) => b.score - a.score);
  // Even with no keyword hits, return the leading curated concepts so the
  // mentor/feed-forward is always grounded in something.
  return scored.slice(0, limit);
}

/**
 * Retrieve, falling back to curated concepts when the chunk store comes up weak.
 * Single entry point for the API routes.
 */
export function retrieveWithFallback(
  query: string,
  options: RetrieveOptions = {},
): { retrieved: RetrievedKnowledge[]; usedFallback: boolean } {
  const retrieved = retrieveKnowledge(query, options);
  if (retrieved.length > 0) {
    return { retrieved, usedFallback: false };
  }
  return {
    retrieved: getFallbackKnowledge(query, options.limit ?? 3),
    usedFallback: true,
  };
}

// ── Prompt + UI formatting ───────────────────────────────────────────────────
/**
 * Render retrieved knowledge as a labelled block for an LLM prompt. Each entry
 * is clearly attributed to its source label so the model can ground (and cite)
 * without inventing quotes.
 */
export function formatKnowledgeForPrompt(
  retrieved: RetrievedKnowledge[],
): string {
  if (retrieved.length === 0) {
    return "(no specific Unknown knowledge retrieved — use general effectuation coaching, and be transparent that this isn't drawn from a specific source)";
  }
  return retrieved
    .map((r, i) => {
      const { chunk } = r;
      return [
        `[${i + 1}] ${chunk.sourceLabel} — ${chunk.title}`,
        chunk.content,
      ].join("\n");
    })
    .join("\n\n");
}

/** Distinct source references for the UI "Grounded in …" row. */
export function getSourceLabels(retrieved: RetrievedKnowledge[]): SourceRef[] {
  const seen = new Set<string>();
  const out: SourceRef[] = [];
  for (const r of retrieved) {
    const label = r.chunk.sourceLabel;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, title: r.chunk.title });
  }
  return out;
}
