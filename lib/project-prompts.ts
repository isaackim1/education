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

export type TrainingMode = "multiple-choice" | "solve" | "written";

function trainingModeRules(mode: TrainingMode): string {
  switch (mode) {
    case "multiple-choice":
      return `ANSWER FORMAT — MULTIPLE CHOICE:
- Present each question as one stem, then exactly four answer options.
- Put each option on its own line formatted exactly as "A) option text", "B) option text", "C) option text", "D) option text".
- Exactly one option is correct. Do not reveal or hint which option is correct in the question.
- When the student answers, state whether their chosen option was correct, then explain briefly.
- The 4-line response limit does not apply to multiple-choice questions — each option must be on its own line.`;
    case "solve":
      return `ANSWER FORMAT — SOLVE / CALCULATE:
- Ask a calculation or problem-solving question that has a definite answer.
- Ask the student to show their working and give a final answer.
- When giving feedback, check both the reasoning/working and the final answer.`;
    case "written":
    default:
      return `ANSWER FORMAT — WRITTEN ANSWER:
- Ask concise exam-style questions that expect a short written answer.
- Keep each question focused and answerable in a few sentences.`;
  }
}

export function buildTrainingSessionSystemPrompt(
  mode: TrainingMode = "written"
): string {
  return `${buildProjectSystemPrompt()}

GUIDED SESSION RULES:
- Ask exactly one exam-style question at a time.
- When told to begin or ask the next question, reply with only one question. Do not include feedback or an answer.
- When the student answers, give concise feedback on that answer only. Do not ask the next question until explicitly told.
- Focus on the active topic when one is provided. Ground questions in the project materials and recent mistakes.
- Keep using the existing [MISTAKE:category] and [RESOLVED] signals exactly as defined above. Do not invent another signal format.

${trainingModeRules(mode)}`;
}

// ─── Teach Back mode (Phase 14B) ─────────────────────────────────────────────
// The student explains a topic in their own words; Ivvy assesses the
// explanation against the topic material and returns structured feedback.

const MAX_TEACH_BACK_MATERIAL_CHARS = 2500;
const MAX_TEACH_BACK_EXPLANATION_CHARS = 3000;
const MAX_TEACH_BACK_TOPIC_NAME_CHARS = 120;
const MAX_TEACH_BACK_SUBJECT_CHARS = 120;
// Final guardrail: stay strictly under /api/agent's 10,000-char contextMessage
// validator even if every field is at its own cap.
const MAX_TEACH_BACK_CONTEXT_CHARS = 9500;

export interface TeachBackContext {
  topicName: string;
  subject: string;
  material: string;
  explanation: string;
}

export function buildTeachBackSystemPrompt(): string {
  return `You are Ivvy, an AI exam trainer running Teach Back mode. The student has explained a topic in their own words, as if teaching it to someone else. Assess their explanation against the topic material and give precise, useful feedback.

Judge only the student's explanation. Treat the provided topic material as the source of truth for what matters. Be specific and reference the actual concepts. Never give generic or hollow praise.

Respond in EXACTLY this format, with each label on its own line and its content on the same line. Use plain text only — no markdown, no bullet characters, no emoji, no extra lines:

RIGHT: what the student got correct (1-3 short points separated by "; ")
MISSING: important points they left out (1-3 short points separated by "; ")
UNCLEAR: anything vague, confused, or imprecise (1-2 short points; if none, write "Nothing major")
NEXT: one focused improvement to work on next (one sentence)
FOLLOWUP: one short question that pushes their understanding further

Keep every line concise. If the explanation is empty or unrelated to the topic, say so plainly in RIGHT and guide the student in NEXT.`;
}

export function buildTeachBackContextMessage(context: TeachBackContext): string {
  const topicName = truncateText(
    context.topicName,
    MAX_TEACH_BACK_TOPIC_NAME_CHARS
  );
  const subject = truncateText(context.subject, MAX_TEACH_BACK_SUBJECT_CHARS);
  const material = truncateText(context.material, MAX_TEACH_BACK_MATERIAL_CHARS);
  const explanation = truncateText(
    context.explanation,
    MAX_TEACH_BACK_EXPLANATION_CHARS
  );

  const lines = [
    `Topic: ${topicName}`,
    `Subject: ${subject || "Not specified"}`,
    "",
    "Topic material (source of truth):",
    material.length > 0 ? material : "No material saved for this topic.",
    "",
    "Student's explanation:",
    explanation.length > 0 ? explanation : "(The student left this blank.)",
    "",
    "Assess the explanation now using the required format.",
  ];

  // Hard cap the assembled message so it always stays under the /api/agent
  // contextMessage validator limit, regardless of field lengths.
  return truncateText(lines.join("\n"), MAX_TEACH_BACK_CONTEXT_CHARS);
}

// ─── Study Sheet mode (Phase 14C) ────────────────────────────────────────────
// Turns a topic's saved material into a structured, exam-ready study sheet.

const MAX_STUDY_SHEET_MATERIAL_CHARS = 4000;
const MAX_STUDY_SHEET_TOPIC_NAME_CHARS = 120;
const MAX_STUDY_SHEET_SUBJECT_CHARS = 120;
// Final guardrail: stay strictly under /api/agent's 10,000-char contextMessage
// validator even if every field is at its own cap.
const MAX_STUDY_SHEET_CONTEXT_CHARS = 9500;

export interface StudySheetContext {
  topicName: string;
  subject: string;
  material: string;
}

export function buildStudySheetSystemPrompt(): string {
  return `You are Ivvy, an AI exam trainer running Study Sheet mode. Turn the student's saved topic material into a focused, exam-ready study sheet. Ground everything in the provided material and stay on the topic. If the material is thin, fill obvious gaps with general subject knowledge, but never contradict the material.

Respond in EXACTLY this format. Each label starts a section on its own line. Use plain text only — no markdown headers, no bold, no emoji.

CORE: one or two sentences capturing the single most important idea of this topic
TERMS:
- term — short definition (3 to 6 key terms, each on its own line starting with "- ")
EXAM:
- a point likely to be tested or worth marks (3 to 6 points, each on its own line starting with "- ")
MISTAKES:
- a common mistake or misconception to avoid (2 to 4 items, each on its own line starting with "- ")
CHECKLIST:
- a concrete thing the student should be able to do (3 to 6 items, each on its own line starting with "- ")
PRACTICE: one exam-style practice question on this topic, without giving the answer

Keep it concise and specific to the topic. Do not add sections beyond these.`;
}

export function buildStudySheetContextMessage(
  context: StudySheetContext
): string {
  const topicName = truncateText(
    context.topicName,
    MAX_STUDY_SHEET_TOPIC_NAME_CHARS
  );
  const subject = truncateText(context.subject, MAX_STUDY_SHEET_SUBJECT_CHARS);
  const material = truncateText(
    context.material,
    MAX_STUDY_SHEET_MATERIAL_CHARS
  );

  const lines = [
    `Topic: ${topicName}`,
    `Subject: ${subject || "Not specified"}`,
    "",
    "Topic material (source of truth):",
    material.length > 0 ? material : "No material saved for this topic.",
    "",
    "Create the study sheet now using the required format.",
  ];

  // Hard cap the assembled message so it always stays under the /api/agent
  // contextMessage validator limit, regardless of field lengths.
  return truncateText(lines.join("\n"), MAX_STUDY_SHEET_CONTEXT_CHARS);
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
