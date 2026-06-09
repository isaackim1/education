"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import MessageThread from "@/components/session/MessageThread";
import SessionInput from "@/components/session/SessionInput";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useChat } from "@/hooks/useChat";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import {
  buildProjectContextMessage,
  buildProjectSystemPrompt,
  type ProjectChatContext,
} from "@/lib/project-prompts";
import type { Material, StudyProject, Topic } from "@/lib/types";
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

function buildProjectChatContext(
  project: StudyProject,
  topics: Topic[],
  materials: Material[],
  activeTopic: string | null
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
    recentUnreviewedMistakes: [],
  };
}

export default function ProjectChatPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded: projectLoaded } = useProject(
    params.projectId
  );
  const { materials, isLoaded: materialsLoaded } = useProjectMaterials(
    params.projectId
  );
  const { messages, isLoaded: chatLoaded, isSending, sendMessage } = useChat(
    params.projectId
  );
  const [input, setInput] = useState("");

  const isLoaded = projectLoaded && materialsLoaded && chatLoaded;

  const materialsWithContent = useMemo(
    () => materials.filter((material) => material.content.trim().length > 0),
    [materials]
  );

  const promptOptions = useMemo(() => {
    if (!project) return null;
    const context = buildProjectChatContext(
      project,
      topics,
      materials,
      null
    );
    return {
      systemPrompt: buildProjectSystemPrompt(),
      contextMessage: buildProjectContextMessage(context),
    };
  }, [project, topics, materials]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!promptOptions) return;
      await sendMessage(content, {
        ...promptOptions,
        mistakeContext: {
          topics,
          activeTopicName: null,
        },
      });
      setInput("");
    },
    [promptOptions, sendMessage, topics]
  );

  const handleAction = useCallback(
    (instruction: string) => {
      void handleSend(instruction);
    },
    [handleSend]
  );

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading training chat...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="inline-block text-sm text-neutral-500 hover:text-black transition-colors mt-4"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col flex-1 min-h-0">
        <ProjectWorkspaceNav projectId={params.projectId} active="chat" />

        <div className="border border-neutral-200 rounded p-3 mb-4">
          <p className="text-sm font-medium text-black">{project.name}</p>
          <p className="text-sm text-neutral-600 mt-1">{project.subject}</p>
          <p className="text-xs text-neutral-500 mt-2">
            {topics.length} topics · {materialsWithContent.length} materials
            with content
          </p>
        </div>

        <div className="flex flex-col flex-1 min-h-[28rem] border border-neutral-200 rounded">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-sm font-medium text-black">
                Ivvy is ready to train
              </p>
              <p className="text-sm text-neutral-600 mt-2 max-w-sm">
                {project.subject} · {topics.length} topics ·{" "}
                {materialsWithContent.length} materials saved
              </p>
              <p className="text-xs text-neutral-500 mt-3 max-w-sm">
                Ivvy will use your project materials to ask direct exam-style
                questions. Click when you are ready — no messages are sent until
                you do.
              </p>
              <button
                type="button"
                onClick={() => void handleSend(START_TRAINING_MESSAGE)}
                disabled={isSending}
                className="mt-6 bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start training
              </button>
            </div>
          ) : (
            <MessageThread messages={messages} agentLabel="Ivvy" />
          )}

          <div className="border-t border-neutral-200 p-4 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PROJECT_ACTIONS.map(({ label, instruction }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleAction(instruction)}
                  disabled={isSending}
                  className="shrink-0 text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      </div>
    </main>
  );
}
