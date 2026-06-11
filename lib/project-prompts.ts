export interface ProjectChatContext {
  projectName: string;
  subject: string;
  examDate: string;
  daysRemaining: number;
  targetGrade: string;
  topics: { name: string; masteryScore?: number }[];
  activeTopic: string | null;
  materials: { topicName: string; content: string; fileName?: string }[];
  recentUnreviewedMistakes?: {
    topicName: string;
    mistakeCategory: string;
    question: string;
    studentAnswer: string;
  }[];
}

const MAX_TOTAL_MATERIAL_CHARS = 3200;

function truncateText(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}...`;
}

function formatMaterials(context: ProjectChatContext): string[] {
  const withContent = context.materials.filter((m) => m.content.trim());
  if (withContent.length === 0) return [];

  const activeLimit = 800;
  const otherLimit = 400;
  const defaultLimit = 600;

  const lines: string[] = ["Student materials:"];
  let totalChars = 0;

  for (const material of withContent) {
    if (totalChars >= MAX_TOTAL_MATERIAL_CHARS) {
      lines.push("(Additional material omitted for length.)");
      break;
    }

    const isActive =
      context.activeTopic !== null &&
      material.topicName === context.activeTopic;
    const limit = context.activeTopic
      ? isActive
        ? activeLimit
        : otherLimit
      : defaultLimit;

    const remaining = MAX_TOTAL_MATERIAL_CHARS - totalChars;
    const snippet = truncateText(material.content, Math.min(limit, remaining));
    if (!snippet) continue;

    lines.push(`Topic: ${material.topicName}`);
    if (material.fileName) {
      lines.push(`Source: ${material.fileName}`);
    }
    lines.push(snippet);
    totalChars += snippet.length;
  }

  return lines;
}

export function buildProjectSystemPrompt(): string {
  return `You are Ivvy, an AI exam trainer. You are not a generic chatbot.

Train the student for their exam. Ask before you explain. Prefer one focused question at a time. Use the student's materials as context when possible.

When the student is wrong: explain briefly, then continue training with one targeted question. Do not give the full answer on the first wrong attempt.

If recent unreviewed mistakes are listed in context, use them actively: retest weak areas with fresh exam-style questions, target the same gaps from new angles, and do not treat already-resolved material as mastered until the student proves it.

MISTAKE SIGNAL: If the student's answer contains a clear error, start your reply with [MISTAKE:category] where category is conceptual, calculation, recall, or application.

RESOLVED SIGNAL: When a previously missed concept is genuinely fixed, start with [RESOLVED] followed by a space.

TONE: Direct, calm, serious, focused. No emoji. No hollow praise. Plain text only. Max 4 lines per response.`;
}

export function buildTrainingSessionSystemPrompt(): string {
  return `${buildProjectSystemPrompt()}

GUIDED SESSION RULES:
- Ask exactly one exam-style question at a time.
- When told to begin or ask the next question, reply with only one question. Do not include feedback or an answer.
- When the student answers, give concise feedback on that answer only. Do not ask the next question until explicitly told.
- Focus on the active topic when one is provided. Ground questions in the project materials and recent mistakes.
- Keep using the existing [MISTAKE:category] and [RESOLVED] signals exactly as defined above. Do not invent another signal format.`;
}

export function buildProjectContextMessage(context: ProjectChatContext): string {
  const lines = [
    `Project: ${context.projectName}`,
    `Subject: ${context.subject}`,
    `Exam date: ${context.examDate}`,
    `Days remaining: ${context.daysRemaining}`,
    `Target grade: ${context.targetGrade}`,
    `Topics: ${
      context.topics.length > 0
        ? context.topics
            .map((t) =>
              typeof t.masteryScore === "number"
                ? `${t.name} (mastery ${t.masteryScore}/5)`
                : t.name
            )
            .join(", ")
        : "none yet"
    }`,
  ];

  if (context.activeTopic) {
    lines.push(`Active topic: ${context.activeTopic}`);
  }

  const materialLines = formatMaterials(context);
  if (materialLines.length > 0) {
    lines.push("");
    lines.push(...materialLines);
  } else {
    lines.push("");
    lines.push("Student materials: none saved yet.");
  }

  const mistakes = context.recentUnreviewedMistakes ?? [];
  if (mistakes.length > 0) {
    lines.push("");
    lines.push("Recent unreviewed mistakes:");
    for (const mistake of mistakes.slice(0, 3)) {
      lines.push(`- Topic: ${truncateText(mistake.topicName, 100)}`);
      lines.push(`  Category: ${truncateText(mistake.mistakeCategory, 40)}`);
      lines.push(`  Question: ${truncateText(mistake.question, 300)}`);
      lines.push(
        `  Student answer: ${truncateText(mistake.studentAnswer, 200)}`
      );
    }
    lines.push(
      "Use these mistakes to guide your next question. Retest weak areas with fresh exam-style questions — do not repeat the same wording."
    );
  }

  lines.push("");
  if (context.materials.some((m) => m.content.trim())) {
    lines.push(
      "Reference the student's actual material when possible. Start with a direct training question — do not greet or introduce yourself."
    );
  } else {
    lines.push(
      "No material is saved yet. Ask which topic the student wants to train first, then ask one direct training question."
    );
  }

  return lines.join("\n");
}
