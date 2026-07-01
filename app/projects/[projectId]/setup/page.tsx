import { redirect } from "next/navigation";

/**
 * Topic setup was absorbed into Materials (the Topics tab). This route now
 * redirects so old links land in the consolidated Materials workspace.
 */
export default function SetupRedirect({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/projects/${params.projectId}/materials?tab=topics`);
}
