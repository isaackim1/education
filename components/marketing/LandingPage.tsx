import Link from "next/link";

function PrimaryButtonLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
    >
      {children}
    </Link>
  );
}

function SecondaryButtonLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center border border-neutral-300 text-sm font-medium px-4 py-2 rounded hover:border-black transition-colors text-black"
    >
      {children}
    </Link>
  );
}

function LogoMark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="w-4 h-4 rounded bg-black" />
      <span className="text-sm font-semibold text-black">StudyCoach</span>
    </Link>
  );
}

function AnnouncementBanner() {
  return (
    <div className="w-full bg-neutral-100 border-b border-neutral-200 py-2 text-center">
      <p className="text-sm text-neutral-700">
        StudyCoach is now free during beta —{" "}
        <Link
          href="/projects/new"
          className="text-black underline hover:text-neutral-600 transition-colors"
        >
          Start for free →
        </Link>
      </p>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <LogoMark />
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-neutral-500 hover:text-black transition-colors"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-neutral-500 hover:text-black transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-neutral-500 hover:text-black transition-colors"
          >
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/projects/new"
            className="hidden md:inline text-sm text-neutral-500 hover:text-black transition-colors"
          >
            Get started
          </Link>
          <PrimaryButtonLink href="/projects/new">Start free →</PrimaryButtonLink>
        </div>
      </div>
    </nav>
  );
}

function HeroMockup() {
  return (
    <div className="border border-neutral-200 rounded overflow-hidden bg-white w-full max-w-lg">
      <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded bg-neutral-300" />
        <span className="w-2 h-2 rounded bg-neutral-300" />
        <span className="w-2 h-2 rounded bg-neutral-300" />
        <div className="flex-1 bg-white border border-neutral-200 rounded px-3 py-1 text-xs text-neutral-400 text-center ml-2">
          studycoach.app/session
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-neutral-50 border border-neutral-200 rounded p-3">
          <p className="text-xs font-medium text-neutral-500 mb-1">Coach</p>
          <p className="text-sm text-black">
            Let&apos;s start with monetary policy. Can you explain what happens
            to inflation when the central bank raises interest rates?
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-neutral-500 mb-1">You</p>
          <div className="bg-white border border-neutral-300 rounded p-3 inline-block text-left max-w-[85%]">
            <p className="text-sm text-black">
              When rates go up, borrowing becomes more expensive, so spending
              decreases and inflation falls.
            </p>
          </div>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded p-3">
          <p className="text-xs font-medium text-neutral-500 mb-1">Coach</p>
          <p className="text-sm text-black">
            Good. Now, what would you expect to happen to unemployment in the
            short run?
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-200 px-4 py-3 flex justify-between items-center gap-3">
        <span className="text-sm text-neutral-400">Type your answer...</span>
        <span className="bg-black text-white px-3 py-1.5 text-xs rounded">
          Send
        </span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="w-full bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col justify-center gap-6">
          <p className="text-xs font-medium text-neutral-500">
            AI-powered exam preparation
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            The AI coach that prepares you for exam day.
          </h1>
          <p className="text-sm text-neutral-600 max-w-md">
            Set up your study plan, work through topics with an AI coach, track
            your mistakes, and arrive at your exam fully prepared.
          </p>
          <div className="flex gap-3 flex-wrap">
            <PrimaryButtonLink href="/projects/new">
              Start studying free →
            </PrimaryButtonLink>
            <SecondaryButtonLink href="#how-it-works">
              See how it works
            </SecondaryButtonLink>
          </div>
          <p className="text-sm text-neutral-500">
            Trusted by students preparing for GMAT, Bar Exam, USMLE, and CFA.
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const exams = ["GMAT", "Bar Exam", "USMLE", "CFA", "LSAT"];
  return (
    <section className="w-full bg-neutral-50 border-y border-neutral-200 py-8">
      <p className="text-xs font-medium text-neutral-400 text-center mb-4">
        Used by students preparing for
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-4">
        {exams.map((exam) => (
          <span key={exam} className="text-sm font-semibold text-neutral-400">
            {exam}
          </span>
        ))}
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-1 h-1 bg-neutral-400 mt-2 shrink-0" />
      <span className="text-sm text-neutral-600">{children}</span>
    </li>
  );
}

function Features() {
  return (
    <section id="features" className="w-full bg-white py-16 border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-medium text-neutral-500 text-center mb-4">
          The StudyCoach platform
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-black text-center mb-4">
          Two ways to use your AI coach
        </h2>
        <p className="text-center text-sm text-neutral-600 max-w-xl mx-auto mb-12">
          Whether you&apos;re starting from scratch or reinforcing weak spots,
          StudyCoach has a mode for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-neutral-200 rounded p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-black">Study Sessions</h3>
              <p className="text-sm text-neutral-500">Guided daily sessions</p>
            </div>
            <p className="text-sm text-neutral-600">
              Work through your study plan day by day. The AI coach adapts to
              your level — explaining concepts, quizzing you, and flagging
              mistakes automatically.
            </p>
            <ul className="space-y-2">
              <Bullet>Learn, Quiz, Review, and Exam-Sim session modes</Bullet>
              <Bullet>Action chips: Explain Simply, Quiz Me, Give Example</Bullet>
              <Bullet>Automatic mistake detection and flagging</Bullet>
              <Bullet>Session summary with tomorrow&apos;s focus</Bullet>
            </ul>
            <div className="border border-neutral-200 rounded p-3 flex gap-2 flex-wrap">
              {[
                { label: "Learn", active: false },
                { label: "Quiz", active: true },
                { label: "Review", active: false },
                { label: "Exam Sim", active: false },
              ].map((pill) => (
                <span
                  key={pill.label}
                  className={`text-xs rounded px-2 py-1 border ${
                    pill.active
                      ? "border-black text-black bg-neutral-100"
                      : "border-neutral-300 text-neutral-500"
                  }`}
                >
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-neutral-200 rounded p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-black">Mistake Bank</h3>
              <p className="text-sm text-neutral-500">Targeted review mode</p>
            </div>
            <p className="text-sm text-neutral-600">
              Every time you get something wrong, it&apos;s saved. Come back to
              review it later — the coach drills you until you&apos;ve genuinely
              resolved the gap.
            </p>
            <ul className="space-y-2">
              <Bullet>Mistakes saved automatically during sessions</Bullet>
              <Bullet>Filter by topic or reviewed/unreviewed status</Bullet>
              <Bullet>Dedicated review mode per mistake</Bullet>
              <Bullet>Marked as resolved only when coach confirms it</Bullet>
            </ul>
            <div className="border border-neutral-200 rounded p-3">
              <div className="flex justify-between items-center gap-2">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
                    Macroeconomics
                  </span>
                  <span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
                    conceptual
                  </span>
                </div>
                <span className="text-xs text-neutral-400 shrink-0">
                  2 days ago
                </span>
              </div>
              <p className="text-xs text-neutral-600 truncate mt-1.5">
                Can you explain what happens when the central bank raises rates?
              </p>
              <p className="text-xs text-neutral-500 mt-1">Review now</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: <CalendarIcon />,
      title: "Set up your exam",
      body: "Enter your subject, exam date, study hours per day, and confidence level. Add your topics and any past exam questions.",
    },
    {
      n: "02",
      icon: <ChatIcon />,
      title: "Study with your AI coach",
      body: "Work through your 14-day plan. The coach guides each session — explaining concepts, asking questions, and adapting to your answers in real time.",
    },
    {
      n: "03",
      icon: <CheckIcon />,
      title: "Fix every weak spot",
      body: "Mistakes are saved automatically. The Mistake Bank lets you review and resolve every gap before exam day arrives.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-medium text-neutral-500 text-center">
          How it works
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-black text-center mt-4">
          Set up once. Study every day.
        </h2>
        <p className="text-center text-sm text-neutral-500 max-w-lg mx-auto mt-3 mb-12">
          Three steps from setup to exam-ready.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.n}>
              <p className="text-xs font-medium text-neutral-400 mb-4">
                {step.n}
              </p>
              <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-sm font-semibold text-black">{step.title}</h3>
              <p className="text-sm text-neutral-600 mt-2">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section className="w-full bg-neutral-50 border-y border-neutral-200 py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-2xl font-semibold text-neutral-200 leading-none mb-4">
          &ldquo;
        </p>
        <p className="text-sm font-medium text-black">
          I used StudyCoach for 6 weeks before my CFA Level 1 exam. Having the
          coach flag my mistakes and drill me on them was the difference. I
          passed on my first attempt.
        </p>
        <div className="mt-6 space-y-1">
          <p className="text-sm font-semibold text-black">Alex M.</p>
          <p className="text-sm text-neutral-500">
            CFA Level 1, passed first attempt
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      id="pricing"
      className="w-full bg-neutral-50 border-b border-neutral-200 py-16 text-center"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Start preparing today.
        </h2>
        <p className="text-sm text-neutral-600 mt-4 max-w-md mx-auto">
          Free during beta. No payment required. Set up your study plan in under
          2 minutes.
        </p>
        <div className="flex justify-center gap-4 mt-8 flex-wrap">
          <PrimaryButtonLink href="/projects/new">Start studying free →</PrimaryButtonLink>
          <SecondaryButtonLink href="#how-it-works">
            See how it works
          </SecondaryButtonLink>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const productLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Get started", href: "/projects/new" },
  ];

  return (
    <footer className="w-full bg-white border-t border-neutral-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <LogoMark />
            <p className="text-sm text-neutral-600 mt-2 max-w-xs">
              AI-powered exam preparation. Built for students who take their
              exams seriously.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-3">Product</p>
            <ul className="space-y-2">
              {productLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-600 hover:text-black transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-200 flex justify-between items-center flex-wrap gap-4">
          <p className="text-xs text-neutral-400">
            © 2026 StudyCoach. All rights reserved.
          </p>
          <p className="text-xs text-neutral-400">
            Built with an AI study coach inside.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <AnnouncementBanner />
      <Nav />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Quote />
      <FinalCTA />
      <Footer />
    </div>
  );
}
