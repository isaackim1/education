import { redirect } from "next/navigation";

// The root path is a thin entry point. For the Unknown Digital University demo
// it leads straight into the Founder Campus at /campus. The older exam/student
// experience (/home, /projects, …) is intentionally kept out of the main entry
// flow but remains fully accessible by direct URL — nothing was removed.
export default function RootPage() {
  redirect("/campus");
}
