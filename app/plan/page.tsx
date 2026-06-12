import { redirect } from "next/navigation";

// The old /plan ("StudyCoach") experience has been retired. Anything that still
// points here is sent to the current Ivvy workspace.
export default function PlanPage() {
  redirect("/projects");
}
