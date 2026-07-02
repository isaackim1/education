import { redirect } from "next/navigation";

/** Legacy pre-project route — the workspace now lives under /projects. */
export default function LegacyRedirect() {
  redirect("/projects");
}
