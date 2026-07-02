import { redirect } from "next/navigation";

// Legacy marketing route — the landing page now lives at the root.
export default function HomePage() {
  redirect("/");
}
