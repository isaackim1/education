import LandingPage from "@/components/marketing/LandingPage";

// The root path IS the marketing landing page: why Ivvy exists. The app
// entrance is /login and /signup; the workspace lives under /projects.
export default function RootPage() {
  return <LandingPage />;
}
