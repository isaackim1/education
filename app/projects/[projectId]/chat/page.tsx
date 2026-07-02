"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import MessageThread from "@/components/session/MessageThread";
import SessionInput from "@/components/session/SessionInput";
import ProjectShell from "@/components/project/ProjectShell";
import { PageHeader } from "@/components/ui/primitives";
import { useChat } from "@/hooks/useChat";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import {
  buildProjectContextMessage,
  buildProjectSystemPrompt,
  type ProjectChatContext,
} from "@/lib/project-prompts";
import {
  getDueProjectMistakes,
  getProjectMistakes,
  getRetrievalAttempts,
} from "@/lib/project-storage";
import { getOverconfidentMistakeIds } from "@/lib/calibration";
import type { Material, Mistake, StudyProject, Topic } from "@/lib/types";
import { daysUntilExam } from "@/lib/utils";

const PROJECT_ACTIONS = [
  { label: "Quiz me", instruction: "Quiz me on my current materials." },
  {
    label: "Explain simply",
    instruction: "Explain the current topic simply.",
  },
  {
    label: "Give example",
    instruction: "Give me a worked example from my materials.",
  },
  {
    label: "I'm stuck",
    instruction: "I'm stuck. Give me a hint, not the full answer.",
  },
] as const;

const START_TRAINING_MESSAGE =
  "Start training me for this exam using my project materials.";

const MAX_REQUIZ_QUESTION_CHARS = 300;
const MAX_REQUIZ_ANSWER_CHARS = 200;

const ACTION_CHIP =
  "shrink-0 inline-flex items-center h-8 px-3 rounded-full border border-[#D8D3C8] text-xs text-[#1A1A17] transition-colors hover:bg-[#EFEBE2] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

function truncateForMessage(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}...`;
}

function getRecentDueMistakes(projectId: string) {
  // Evidence loop: a mistake the student got wrong while feeling certain is the
  // most dangerous gap, so the next training session leads with it. Recency
  // breaks ties within each group.
  const dangerous = getOverconfidentMistakeIds(getRetrievalAttempts(projectId));
  return getDueProjectMistakes(projectId)
    .sort((a, b) => {
      const aRank = dangerous.has(a.id) ? 0 : 1;
      const bRank = dangerous.has(b.id) ? 0 : 1;
      if (aRank !== bRank) return aRank - bRank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3)
    .map((mistake) => ({
      topicName: mistake.topicName,
      mistakeCategory: mistake.mistakeCategory,
      question: mistake.question,
      studentAnswer: mistake.studentAnswer,
    }));
}

function buildProjectChatContext(
  project: StudyProject,
  topics: Topic[],
  materials: Material[],
  activeTopic: string | null,
  projectId: string
): ProjectChatContext {
  const topicNameById = new Map(topics.map((topic) => [topic.id, topic.name]));

  return {
    projectName: project.name,
    subject: project.subject,
    examDate: project.examDate,
    daysRemaining: daysUntilExam(project.examDate),
    targetGrade: project.targetGrade,
    topics: topics.map((topic) => ({
      name: topic.name,
      masteryScore: topic.masteryScore,
    })),
    activeTopic,
    materials: materials
      .filter((material) => material.content.trim())
      .map((material) => ({
        topicName: topicNameById.get(material.topicId) ?? "Unknown topic",
        content: material.content.trim(),
        fileName: material.fileName,
      })),
    recentDueMistakes: getRecentDueMistakes(projectId),
  };
}

function buildRequizMessage(mistake: Mistake): string {
  const question = truncateForMessage(
    mistake.question,
    MAX_REQUIZ_QUESTION_CHARS
  );
  const answer = truncateForMessage(
    mistake.studentAnswer,
    MAX_REQUIZ_ANSWER_CHARS
  );
  return `Retest me on this saved mistake. Question: ${question}. My previous answer: ${answer}. Do not reveal the answer immediately. Ask me a fresh exam-style question that tests the same weakness.`;
}

function ProjectChatContent({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMistakeId = searchParams.get("mistakeId");

  const { project, topics, isLoaded: projectLoaded } = useProject(projectId);
  const { materials, isLoaded: materialsLoaded } = useProjectMaterials(
    projectId
  );
  const { messages, isLoaded: chatLoaded, isSending, sendMessage } = useChat(
    projectId
  );
  const [input, setInput] = useState("");
  const [activeTopicName, setActiveTopicName] = useState<string | null>(null);
  const [requizMistake, setRequizMistake] = useState<Mistake | null>(null);

  const isLoaded = projectLoaded && materialsLoaded && chatLoaded;

  useEffect(() => {
    if (!requestedMistakeId) {
      setRequizMistake(null);
      return;
    }
    const mistake = getProjectMistakes(projectId).find(
      (m) => m.id === requestedMistakeId
    );
    setRequizMistake(mistake ?? null);
    if (mistake && topics.some((t) => t.name === mistake.topicName)) {
      setActiveTopicName(mistake.topicName);
    }
  }, [requestedMistakeId, projectId, topics]);

  const materialsWithContent = useMemo(
    () => materials.filter((material) => material.content.trim().length > 0),
    [materials]
  );

  const trainingContextParts = [
    activeTopicName ?? "All topics",
    materialsWithContent.length > 0 ? "materials" : "no materials yet",
  ];
  if (getDueProjectMistakes(projectId).length > 0) {
    trainingContextParts.push("mistakes due");
  }
  const trainingContextNote = `Training with: ${trainingContextParts.join(" · ")}`;

  const buildPromptOptions = useCallback(
    (activeTopic: string | null) => {
      if (!project) return null;
      const context = buildProjectChatContext(
        project,
        topics,
        materials,
        activeTopic,
        projectId
      );
      return {
        systemPrompt: buildProjectSystemPrompt(),
        contextMessage: buildProjectContextMessage(context),
      };
    },
    [project, topics, materials, projectId]
  );

  const handleSend = useCallback(
    async (content: string) => {
      const promptOptions = buildPromptOptions(activeTopicName);
      if (!promptOptions) return;
      await sendMessage(content, {
        ...promptOptions,
        mistakeContext: {
          topics,
          activeTopicName,
        },
      });
      setInput("");
    },
    [buildPromptOptions, activeTopicName, sendMessage, topics]
  );

  const handleStartRequiz = useCallback(() => {
    if (!requizMistake) return;
    void handleSend(buildRequizMessage(requizMistake));
    router.replace(`/projects/${projectId}/chat`, { scroll: false });
    setRequizMistake(null);
  }, [requizMistake, handleSend, router, projectId]);

  const handleAction = useCallback(
    (instruction: string) => {
      void handleSend(instruction);
    },
    [handleSend]
  );

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-sm text-[#56524B]">Loading training chat...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#FAF8F4]">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1A1A17]">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ProjectShell projectId={projectId} active="coach" width="max-w-3xl">
      <PageHeader
        eyebrow="Adaptive training"
        title="Training chat"
        description="Ivvy asks exam-style questions, saves your mistakes, and can use recent due mistakes to guide what comes next."
      />

        {requizMistake ? (
          <div className="rounded-2xl border border-[#D8D3C8] bg-[#EFEBE2] p-4 mb-4">
            <p className="text-xs font-medium text-[#56524B]">Mistake review</p>
            <p className="text-sm text-[#1A1A17] mt-1">
              Requiz on: {requizMistake.topicName} ·{" "}
              {requizMistake.mistakeCategory}
            </p>
            <p className="text-xs text-[#56524B] mt-2 line-clamp-2">
              {requizMistake.question}
            </p>
            <button
              type="button"
              onClick={handleStartRequiz}
              disabled={isSending}
              className="mt-3 inline-flex items-center h-9 px-4 rounded-full bg-[#1A1A17] text-white text-xs font-medium transition-colors hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
            >
              Start requiz
            </button>
          </div>
        ) : null}

        {topics.length > 0 ? (
          <div className="mb-4">
            <label
              htmlFor="active-topic"
              className="block text-xs font-medium text-[#56524B] mb-1.5"
            >
              Topic focus
            </label>
            <select
              id="active-topic"
              value={activeTopicName ?? ""}
              onChange={(e) =>
                setActiveTopicName(e.target.value === "" ? null : e.target.value)
              }
              className="w-full h-11 rounded-lg border border-[#D8D3C8] bg-white px-3 text-sm text-[#1A1A17] transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15"
            >
              <option value="">All topics</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#7A766D] mt-2">{trainingContextNote}</p>
          </div>
        ) : (
          <p className="text-xs text-[#7A766D] mb-4">{trainingContextNote}</p>
        )}

        <div className="flex flex-col flex-1 min-h-[28rem] rounded-2xl border border-[#E7E3DA] bg-white overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-base font-medium text-[#1A1A17]">
                Ready to train
              </p>
              <p className="text-sm text-[#56524B] mt-2 max-w-sm">
                Ivvy will quiz you on {project.subject}. Wrong answers are saved
                to your mistake bank. Nothing is sent until you start.
              </p>
              {topics.length === 0 ? (
                <p className="text-xs text-[#7A766D] mt-3 max-w-sm">
                  Add topics and materials first for sharper questions.
                </p>
              ) : materialsWithContent.length === 0 ? (
                <p className="text-xs text-[#7A766D] mt-3 max-w-sm">
                  Add materials per topic so Ivvy can ground questions in your
                  notes.
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void handleSend(START_TRAINING_MESSAGE)}
                disabled={isSending}
                className="mt-6 inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1A1A17] text-white text-sm font-medium transition-colors hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
              >
                Start training
              </button>
            </div>
          ) : (
            <MessageThread messages={messages} agentLabel="Ivvy" />
          )}

          <div className="border-t border-[#E7E3DA] p-4 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PROJECT_ACTIONS.map(({ label, instruction }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleAction(instruction)}
                  disabled={isSending}
                  className={ACTION_CHIP}
                >
                  {label}
                </button>
              ))}
            </div>
            <SessionInput
              value={input}
              onChange={setInput}
              onSubmit={() => void handleSend(input)}
              disabled={isSending}
            />
          </div>
        </div>
    </ProjectShell>
  );
}

export default function ProjectChatPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
          <p className="text-sm text-[#56524B]">Loading training chat...</p>
        </main>
      }
    >
      <ProjectChatContent projectId={params.projectId} />
    </Suspense>
  );
}
