import type { Message, SessionMode } from "./types";
import { generateId } from "./utils";

export interface MockAgentParams {
  mode: SessionMode;
  topicNames: string[];
  lastUserMessage: string | null;
  actionInstruction: string | null;
  messageCount: number;
}

function createMessage(
  content: string,
  mode: SessionMode,
  flaggedMistake = false
): Message {
  return {
    id: generateId(),
    role: "agent",
    content,
    mode,
    flaggedMistake,
    timestamp: new Date().toISOString(),
  };
}

function primaryTopic(topicNames: string[]): string {
  return topicNames[0] ?? "today's topic";
}

function topicList(topicNames: string[]): string {
  if (topicNames.length === 0) return "today's topics";
  if (topicNames.length === 1) return topicNames[0];
  if (topicNames.length === 2) return `${topicNames[0]} and ${topicNames[1]}`;
  return `${topicNames.slice(0, -1).join(", ")}, and ${topicNames[topicNames.length - 1]}`;
}

export function createOpeningMessage(params: {
  mode: SessionMode;
  topicNames: string[];
}): Message {
  const { mode, topicNames } = params;
  const focus = topicList(topicNames);
  const topic = primaryTopic(topicNames);

  const focusSentence = `Today we focus on ${focus}.`;
  let question: string;

  switch (mode) {
    case "quiz":
      question = `First question — without notes: what is the main idea of ${topic}?`;
      break;
    case "review":
      question = `Before we review, recall from memory: what key point about ${topic} do you find hardest?`;
      break;
    case "exam":
      question = `Exam simulation starts now. In 2 sentences, define ${topic} as you would on the exam.`;
      break;
    default:
      question = `First, answer without notes: what is the main idea of ${topic}?`;
  }

  return createMessage(`${focusSentence} ${question}`, mode);
}

function isShortAnswer(text: string): boolean {
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  return trimmed.length < 40 || wordCount < 8;
}

function handleAction(
  instruction: string,
  mode: SessionMode,
  topicNames: string[]
): Message {
  const topic = primaryTopic(topicNames);
  const lower = instruction.toLowerCase();

  if (lower.includes("quiz me")) {
    return createMessage(
      `Quick quiz: what is ${topic}, and why does it matter?`,
      mode
    );
  }

  if (lower.includes("explain") && lower.includes("simply")) {
    return createMessage(
      `Before I explain ${topic}, which part feels least clear?`,
      mode
    );
  }

  if (lower.includes("give example") || lower.includes("example")) {
    return createMessage(
      `Before I give an example, where might you encounter ${topic} in a real problem?`,
      mode
    );
  }

  if (lower.includes("show steps") || lower.includes("steps")) {
    return createMessage(
      `Step 1 for ${topic}: identify what is changing and what is being measured.\nTry step 1 yourself — what are the two variables here?`,
      mode
    );
  }

  if (lower.includes("harder")) {
    return createMessage(
      `Harder question: compare ${topic} with a related idea. What is the most important difference?`,
      mode
    );
  }

  if (lower.includes("easier")) {
    return createMessage(
      `Easier recall: what is ${topic} in your own words?`,
      mode
    );
  }

  if (lower.includes("weak topic")) {
    return createMessage(
      `Noted — ${topic} is marked as a weak area for this session. We'll keep drilling it.\nWhat part of ${topic} feels least clear right now?`,
      mode
    );
  }

  if (lower.includes("continue")) {
    return createMessage(
      `Let's keep going. What is the single most important definition you need for ${topic} on exam day?`,
      mode
    );
  }

  return createMessage(
    `Focus on ${topic}. What is the key mechanism you would write in an exam answer?`,
    mode
  );
}

export function getMockAgentReply(params: MockAgentParams): Message {
  const { mode, topicNames, lastUserMessage, actionInstruction } = params;
  const topic = primaryTopic(topicNames);

  if (actionInstruction) {
    return handleAction(actionInstruction, mode, topicNames);
  }

  if (!lastUserMessage || !lastUserMessage.trim()) {
    return createMessage(
      `Give me your best attempt on ${topic} before I explain anything.`,
      mode
    );
  }

  if (isShortAnswer(lastUserMessage)) {
    return createMessage(
      `Your answer is too vague. Try again: what is the key idea behind ${topic}?`,
      mode,
      true
    );
  }

  return createMessage(
    `Good start. Now make it exam-ready: explain ${topic} in one sentence using the correct term.`,
    mode,
    false
  );
}
