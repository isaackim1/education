// Phase 12D-A — material sorting prompt builders + output sanitizer.
// Pure, dependency-free helpers. The API route in app/api/sort-material/route.ts
// owns all I/O; everything here is deterministic and easy to review/test.

export const MAX_SORTING_TOPICS = 20;
export const MAX_SORTING_SEGMENTS = 30;
export const MAX_SEGMENT_CHARS = 1000;

export interface MaterialSortingContext {
  topics: string[];
  segments: string[];
  subject?: string;
}

export interface MaterialAssignment {
  segment: number;
  topic: string | null;
}

// Trim, drop empties, de-duplicate (case-insensitive), and cap the topic list.
export function normalizeSortingTopics(
  raw: string[],
  max = MAX_SORTING_TOPICS
): string[] {
  const topics: string[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const topic = item.trim();
    if (!topic) continue;
    const normalized = topic.toLocaleLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    topics.push(topic);
    if (topics.length >= max) break;
  }

  return topics;
}

// Trim, drop empties, cap count, and truncate each segment before it is sent.
export function normalizeSortingSegments(
  raw: string[],
  maxCount = MAX_SORTING_SEGMENTS,
  maxChars = MAX_SEGMENT_CHARS
): string[] {
  const segments: string[] = [];

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const segment = item.trim();
    if (!segment) continue;
    segments.push(segment.slice(0, maxChars));
    if (segments.length >= maxCount) break;
  }

  return segments;
}

export function buildMaterialSortingSystemPrompt(): string {
  return `You are Ivvy, an exam training workspace.

You organize a student's study material into their EXISTING exam topics.

You receive a numbered list of topics and a numbered list of text segments.
Assign each segment to the single best-fitting topic, or null if no topic clearly fits.

Rules:
- Use only the topics provided. Do not invent, rename, merge, or split topics.
- Copy the chosen topic name verbatim, or use null when no topic fits.
- Do not rewrite, summarize, translate, or quote the material.
- Return ONLY a JSON array. Each element is {"segment": <segment number>, "topic": <exact topic name or null>}.
- Include exactly one element for every segment number.
- No prose, markdown, code fences, numbering, or explanation.`;
}

export function buildMaterialSortingContextMessage({
  topics,
  segments,
  subject,
}: MaterialSortingContext): string {
  const topicLines = topics.map((topic, index) => `${index + 1}. ${topic}`);
  const segmentLines = segments.map(
    (segment, index) => `[${index}] ${segment}`
  );

  return [
    `Subject: ${subject?.trim() || "Not specified"}`,
    "",
    "Topics (assign by exact name):",
    ...topicLines,
    "",
    "Segments:",
    ...segmentLines,
    "",
    'Return a JSON array. For every segment index above, output {"segment": index, "topic": "<exact topic name>" or null}.',
  ].join("\n");
}

// Extract a JSON array from possibly fenced / chatty model text. Returns the
// parsed value or null when nothing usable is found.
function parseAssignmentsArray(raw: string): unknown {
  const withoutFences = raw
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "");
  const firstBracket = withoutFences.indexOf("[");
  const lastBracket = withoutFences.lastIndexOf("]");
  if (firstBracket === -1 || lastBracket <= firstBracket) return null;

  try {
    return JSON.parse(withoutFences.slice(firstBracket, lastBracket + 1));
  } catch {
    return null;
  }
}

/**
 * Defensively map raw model output to one assignment per segment index.
 *
 * Guarantees:
 * - Always returns exactly `segmentCount` assignments, indices 0..segmentCount-1.
 * - Unknown topic names (and non-string topics) become null.
 * - Out-of-range or non-integer segment indices are ignored.
 * - On duplicate indices, the first in-range occurrence wins.
 * - Missing segments default to null.
 * - Non-array / malformed output yields all-null rather than throwing.
 */
export function sanitizeMaterialAssignments(
  raw: unknown,
  topics: string[],
  segmentCount: number
): MaterialAssignment[] {
  const count =
    Number.isInteger(segmentCount) && segmentCount > 0 ? segmentCount : 0;

  // Canonical (verbatim) topic lookup keyed by normalized name.
  const canonicalByNormalized = new Map<string, string>();
  for (const topic of topics) {
    if (typeof topic !== "string") continue;
    const trimmed = topic.trim();
    const normalized = trimmed.toLocaleLowerCase();
    if (normalized && !canonicalByNormalized.has(normalized)) {
      canonicalByNormalized.set(normalized, trimmed);
    }
  }

  const resolved: (string | null)[] = new Array(count).fill(null);
  const taken = new Array<boolean>(count).fill(false);

  let value = raw;
  if (typeof value === "string") {
    value = parseAssignmentsArray(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object") continue;
      const segment = (item as { segment?: unknown }).segment;
      if (
        !Number.isInteger(segment) ||
        (segment as number) < 0 ||
        (segment as number) >= count
      ) {
        continue;
      }
      const index = segment as number;
      if (taken[index]) continue; // first in-range assignment wins

      const topicRaw = (item as { topic?: unknown }).topic;
      let topic: string | null = null;
      if (typeof topicRaw === "string") {
        topic =
          canonicalByNormalized.get(topicRaw.trim().toLocaleLowerCase()) ??
          null;
      }

      resolved[index] = topic;
      taken[index] = true;
    }
  }

  return resolved.map((topic, segment) => ({ segment, topic }));
}
