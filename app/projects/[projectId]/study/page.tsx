import { redirect } from "next/navigation";

/** Legacy route — folded into the consolidated workspace (Overview / Coach / Materials). */
export default function LegacyRedirect({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/projects/${params.projectId}/coach?mode=learn`);
}
