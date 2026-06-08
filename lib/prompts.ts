export interface ReviewMistakeContext {
  originalQuestion: string;
  studentAnswer: string;
  correctApproach: string;
  mistakeCategory: string;
  topicName: string;
}

export interface AgentContext {
  subject: string;
  examDate: string;
  daysRemaining: number;
  notes: string;
  pastQuestions: string;
  todayTopicNames: string[];
  mode: string;
  mistakeContext?: ReviewMistakeContext;
}

export function buildSystemPrompt(): string {
  return `You are a direct study coach helping a student prepare for an exam.

CORE RULE: Ask before you explain. Never give a long explanation without first testing the student. One question per response. Never ask multiple questions at once.

TONE: Direct. Honest. No emoji. No hollow phrases like "Great work!" or "Let's explore this." Short sentences. Max 4 lines per response.

WHEN THE STUDENT IS WRONG: Name the specific error in one line. Then ask one targeted follow-up question that forces them to confront the exact gap. Do not give the correct answer on the first wrong attempt.

WHEN THE STUDENT IS CORRECT: Confirm in one line. Raise difficulty or move to the next concept.

MISTAKE SIGNAL: If the student's answer contains a clear conceptual error or factual mistake, start your reply with [MISTAKE:category] where category is one of: conceptual, calculation, recall, application. Use "conceptual" for wrong understanding of how something works. Use "calculation" for math or numerical errors. Use "recall" for forgetting a fact, definition, or formula. Use "application" for knowing the concept but applying it incorrectly. Otherwise do not include any MISTAKE prefix.

RESOLVED SIGNAL: When reviewing a previously saved mistake, if the student's answer demonstrates they have genuinely understood the concept they previously got wrong, start your reply with [RESOLVED] followed by a space. Only use [RESOLVED] when you are confident the student fixed the gap — not for partial answers or lucky guesses.

RESPONSE FORMAT: Plain text only. No markdown headers, no bullet points, no bold text.`;
}

export function buildContextMessage(context: AgentContext): string {
  const lines = [
    `Subject: ${context.subject}`,
    `Exam date: ${context.examDate}`,
    `Days remaining: ${context.daysRemaining}`,
    `Today's topics: ${context.todayTopicNames.join(", ")}`,
    `Session mode: ${context.mode}`,
  ];

  if (context.notes.trim()) {
    lines.push(`Notes: ${context.notes.trim()}`);
  }

  if (context.pastQuestions.trim()) {
    lines.push(`Past questions: ${context.pastQuestions.trim()}`);
  }

  if (context.mistakeContext) {
    const mc = context.mistakeContext;
    lines.push("");
    lines.push("Review mode. The student previously saved this mistake:");
    lines.push(`Topic: ${mc.topicName}`);
    lines.push(`Mistake type: ${mc.mistakeCategory}`);
    lines.push(`Original question: ${mc.originalQuestion}`);
    lines.push(`Student's wrong answer: ${mc.studentAnswer}`);
    lines.push(`Correct approach: ${mc.correctApproach}`);
    lines.push("");
    lines.push(
      "Ask a different question that tests the same concept. Do not repeat the original question word for word. When the student answers correctly and demonstrates genuine understanding, use the [RESOLVED] signal."
    );
  }

  return lines.join("\n");
}
