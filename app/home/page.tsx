import LandingPage from "@/components/marketing/LandingPage";

// /home is the product marketing home. It always renders the landing page —
// no localStorage or project-based gating, so it never redirects to /projects.
export default function HomePage() {
  return <LandingPage />;
}
