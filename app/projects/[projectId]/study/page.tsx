import { redirect } from "next/navigation";

/**
 * The Study hub was absorbed into Coach. This route now redirects so old
 * links and bookmarks land in the consolidated Coach workspace. The teach and
 * study-sheet modes still live at /study/teach and /study/sheet.
 */
export default function StudyRedirect({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/projects/${params.projectId}/coach`);
}
