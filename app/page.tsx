import { redirect } from "next/navigation";

// The root path is a thin entry point: it always sends visitors to the
// marketing home at /home. No localStorage or project-based gating here.
export default function RootPage() {
  redirect("/home");
}
