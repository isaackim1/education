"use client";

import Link from "next/link";
import ProjectTopicManager from "@/components/project/ProjectTopicManager";
import TopicSuggestionPanel from "@/components/project/TopicSuggestionPanel";
import ProjectShell from "@/components/project/ProjectShell";
import {
  CenteredNotice,
  Eyebrow,
  PageHeader,
  PageShell,
  PrimaryActionCard,
  primaryAction,
  StatusPill,
} from "@/components/ui/primitives";
import { useProject } from "@/hooks/useProject";

export default function ProjectSetupPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded, addTopic, deleteTopic } = useProject(
    params.projectId
  );

  if (!isLoaded) {
    return <CenteredNotice>Loading project topics…</CenteredNotice>;
  }

  if (!project) {
    return (
      <PageShell width="max-w-lg">
        <h1 className="font-serif text-[34px] leading-[1.08] tracking-[-0.01em] text-[#1A1A17]">
          Project not found
        </h1>
        <Link
          href="/projects"
          className="mt-4 inline-flex h-9 -ml-3 items-center rounded-full px-3 text-sm text-[#56524B] transition-colors duration-200 hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
        >
          Back to projects
        </Link>
      </PageShell>
    );
  }

  return (
    <ProjectShell projectId={params.projectId} active="setup">
      <PageHeader
        eyebrow="Training map"
        title="Topics"
        description="Topics define what Ivvy trains you on. The fastest way to build them is to upload your material once and let Ivvy organize it."
        action={
          <StatusPill>
            {topics.length} topic{topics.length === 1 ? "" : "s"}
          </StatusPill>
        }
      />

      <div className="space-y-8">
        <PrimaryActionCard
          eyebrow="Recommended"
          title="Upload once and organize"
          description="Upload your materials once. Ivvy extracts topics and sorts the material into them, so you can review the whole map before anything is saved."
          action={
            <Link
              href={`/projects/${params.projectId}/import`}
              className={primaryAction}
            >
              Upload once
            </Link>
          }
        />

        <section>
          <div className="mb-4">
            <Eyebrow>Or build topics manually</Eyebrow>
            <p className="mt-1.5 text-sm text-[#56524B]">
              Prefer to build your topic list by hand? Add topics directly, or
              paste material to suggest a starting set.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <div className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
              <ProjectTopicManager
                projectId={params.projectId}
                topics={topics}
                onAddTopic={addTopic}
                onDeleteTopic={deleteTopic}
              />
            </div>

            <TopicSuggestionPanel
              projectId={params.projectId}
              subject={project.subject}
              existingTopics={topics}
              onAddTopic={addTopic}
            />
          </div>
        </section>
      </div>
    </ProjectShell>
  );
}
