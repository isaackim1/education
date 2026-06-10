export interface TopicExtractionContext {
  subject: string;
  existingTopics: string[];
  materialText: string;
}

export function buildTopicExtractionSystemPrompt(): string {
  return `You are Ivvy, an exam training workspace.

Read the student's exam materials and identify the clearest study topics they should train.

Return ONLY a JSON array of 5 to 15 short topic names.
Each topic name must be 2 to 6 words.
Use practical exam-study language.
Merge near-duplicates and overlapping topics.
Exclude administration, scheduling, assessment logistics, contact details, and generic course information.
Do not include topics that already exist in the project.
No prose, markdown, numbering, bullets, or explanation.`;
}

export function buildTopicExtractionContextMessage({
  subject,
  existingTopics,
  materialText,
}: TopicExtractionContext): string {
  return [
    `Subject: ${subject.trim() || "Not specified"}`,
    `Existing topics to avoid: ${
      existingTopics.length > 0 ? existingTopics.join(", ") : "none"
    }`,
    "",
    "Exam materials:",
    materialText,
  ].join("\n");
}

export function sanitizeTopics(raw: unknown): string[] {
  let value = raw;

  if (typeof value === "string") {
    const withoutFences = value.replace(/```(?:json)?/gi, "").replace(/```/g, "");
    const firstBracket = withoutFences.indexOf("[");
    const lastBracket = withoutFences.indexOf("]", firstBracket + 1);

    if (firstBracket === -1 || lastBracket === -1) return [];

    try {
      value = JSON.parse(withoutFences.slice(firstBracket, lastBracket + 1));
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  const topics: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") continue;

    const topic = item
      .trim()
      .replace(/^(?:[-*•]\s*|\d+[.)]\s*)/, "")
      .trim()
      .slice(0, 60)
      .trim();
    const normalized = topic.toLocaleLowerCase();

    if (!topic || seen.has(normalized)) continue;

    seen.add(normalized);
    topics.push(topic);
    if (topics.length === 20) break;
  }

  return topics;
}
