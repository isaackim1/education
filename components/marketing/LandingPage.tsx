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
      className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
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
      className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-[#C4C7C5] text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}

function LogoMark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
    >
      <span className="w-5 h-5 rounded-md bg-[#1F1F1F]" />
      <span className="text-sm font-semibold text-[#1F1F1F]">Ivvy</span>
    </Link>
  );
}

function AnnouncementBanner() {
  return (
    <div className="w-full bg-[#F1F3F4] border-b border-[#E1E3E1] py-2 text-center">
      <p className="text-sm text-[#5F6368]">
        Ivvy is now free during beta —{" "}
        <Link
          href="/projects/new"
          className="font-medium text-[#1F1F1F] underline underline-offset-2 transition-colors hover:text-black"
        >
          Start for free →
        </Link>
      </p>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-[#E1E3E1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <LogoMark />
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-[#5F6368] hover:text-[#1F1F1F] transition-colors"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-[#5F6368] hover:text-[#1F1F1F] transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-[#5F6368] hover:text-[#1F1F1F] transition-colors"
          >
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/projects/new"
            className="hidden md:inline-flex items-center h-9 px-3 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
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
    <div className="border border-[#E1E3E1] rounded-2xl overflow-hidden bg-white w-full max-w-lg shadow-sm">
      <div className="bg-[#F8FAFD] border-b border-[#E1E3E1] px-4 py-2.5 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#DADCE0]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#DADCE0]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#DADCE0]" />
        <div className="flex-1 bg-white border border-[#E1E3E1] rounded-full px-3 py-1 text-xs text-[#80868B] text-center ml-2">
          ivvy.app/projects/[id]/chat
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-[#F8FAFD] border border-[#E1E3E1] rounded-2xl p-3">
          <p className="text-xs font-medium text-[#5F6368] mb-1">Ivvy</p>
          <p className="text-sm text-[#1F1F1F]">
            Let&apos;s start with monetary policy. Can you explain what happens
            to inflation when the central bank raises interest rates?
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-[#5F6368] mb-1">You</p>
          <div className="bg-[#1F1F1F] rounded-2xl p-3 inline-block text-left max-w-[85%]">
            <p className="text-sm text-white">
              When rates go up, borrowing becomes more expensive, so spending
              decreases and inflation falls.
            </p>
          </div>
        </div>
        <div className="bg-[#F8FAFD] border border-[#E1E3E1] rounded-2xl p-3">
          <p className="text-xs font-medium text-[#5F6368] mb-1">Ivvy</p>
          <p className="text-sm text-[#1F1F1F]">
            Good. Now, what would you expect to happen to unemployment in the
            short run?
          </p>
        </div>
      </div>
      <div className="border-t border-[#E1E3E1] px-4 py-3 flex justify-between items-center gap-3">
        <span className="text-sm text-[#80868B]">Type your answer...</span>
        <span className="inline-flex items-center bg-[#1F1F1F] text-white px-4 py-1.5 text-xs rounded-full">
          Send
        </span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="w-full bg-white pt-16 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col justify-center gap-6">
          <span className="inline-flex items-center self-start h-7 px-3 rounded-full bg-[#F1F3F4] text-xs font-medium text-[#5F6368]">
            AI-powered exam training
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1F1F1F] leading-tight">
            Your exam materials, turned into a personal AI trainer.
          </h1>
          <p className="text-base text-[#5F6368] max-w-md">
            Dump your notes. Add your topics. Ivvy trains you on exactly what
            your exam tests.
          </p>
          <div className="flex gap-3 flex-wrap">
            <PrimaryButtonLink href="/projects/new">
              Create your study project →
            </PrimaryButtonLink>
            <SecondaryButtonLink href="#how-it-works">
              See how it works
            </SecondaryButtonLink>
          </div>
          <p className="text-sm text-[#80868B]">
            Built for exam prep across GMAT, Bar Exam, USMLE, CFA, university
            finals, and resits.
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
    <section className="w-full bg-[#F8FAFD] border-y border-[#E1E3E1] py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-[#80868B] text-center mb-4">
        Built for
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-4">
        {exams.map((exam) => (
          <span key={exam} className="text-sm font-semibold text-[#80868B]">
            {exam}
          </span>
        ))}
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#80868B] mt-2 shrink-0" />
      <span className="text-sm text-[#5F6368]">{children}</span>
    </li>
  );
}

function Features() {
  return (
    <section id="features" className="w-full bg-white py-20 border-b border-[#E1E3E1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#5F6368] text-center mb-4">
          The Ivvy platform
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#1F1F1F] text-center mb-4">
          Train on your materials, not generic answers
        </h2>
        <p className="text-center text-base text-[#5F6368] max-w-xl mx-auto mb-12">
          Claude answers your study questions. Ivvy trains you for the exam.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#E1E3E1] rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold text-[#1F1F1F]">
                Study Sessions
              </h3>
              <p className="text-sm text-[#80868B]">Guided daily sessions</p>
            </div>
            <p className="text-sm text-[#5F6368]">
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
            <div className="border border-[#E1E3E1] rounded-2xl p-3 flex gap-2 flex-wrap">
              {[
                { label: "Learn", active: false },
                { label: "Quiz", active: true },
                { label: "Review", active: false },
                { label: "Exam Sim", active: false },
              ].map((pill) => (
                <span
                  key={pill.label}
                  className={`text-xs rounded-full px-3 py-1 ${
                    pill.active
                      ? "bg-[#E8EAED] text-[#1F1F1F] font-medium"
                      : "border border-[#E1E3E1] text-[#5F6368]"
                  }`}
                >
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-[#E1E3E1] rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold text-[#1F1F1F]">
                Mistake Bank
              </h3>
              <p className="text-sm text-[#80868B]">Targeted review mode</p>
            </div>
            <p className="text-sm text-[#5F6368]">
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
            <div className="border border-[#E1E3E1] rounded-2xl p-3">
              <div className="flex justify-between items-center gap-2">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-[#F1F3F4] rounded-full px-3 py-0.5 text-[#5F6368]">
                    Macroeconomics
                  </span>
                  <span className="text-xs bg-[#F1F3F4] rounded-full px-3 py-0.5 text-[#5F6368]">
                    conceptual
                  </span>
                </div>
                <span className="text-xs text-[#80868B] shrink-0">
                  2 days ago
                </span>
              </div>
              <p className="text-xs text-[#5F6368] truncate mt-1.5">
                Can you explain what happens when the central bank raises rates?
              </p>
              <p className="text-xs font-medium text-[#1F1F1F] mt-1">Review now</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Create your study project",
      body: "Add your subject, exam date, target grade, and the topics your exam covers.",
    },
    {
      n: "2",
      title: "Dump your materials",
      body: "Paste your notes, syllabus, past questions, marking criteria, and personal weak points.",
    },
    {
      n: "3",
      title: "Train for the exam",
      body: "Ivvy uses your materials to test your understanding, adapt to your answers, and focus on weak areas.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#5F6368] text-center">
          How it works
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#1F1F1F] text-center mt-4">
          From scattered materials to focused training.
        </h2>
        <p className="text-center text-base text-[#5F6368] max-w-lg mx-auto mt-3 mb-12">
          Three steps from project setup to exam-day practice.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.n}
              className="border border-[#E1E3E1] rounded-2xl p-6 bg-white"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1F1F1F] text-white text-sm font-semibold">
                {step.n}
              </span>
              <h3 className="text-base font-semibold text-[#1F1F1F] mt-4">
                {step.title}
              </h3>
              <p className="text-sm text-[#5F6368] mt-2">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section className="w-full bg-[#F8FAFD] border-y border-[#E1E3E1] py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-lg font-medium text-[#1F1F1F]">
          Ivvy turns your exam materials into a personal AI training system.
        </p>
        <p className="text-base text-[#5F6368] mt-3">
          Add your topics, dump your notes, and train on what your exam actually
          tests — not generic study chat.
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      id="pricing"
      className="w-full bg-[#F8FAFD] border-b border-[#E1E3E1] py-20 text-center"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-[#1F1F1F]">
          Start preparing today.
        </h2>
        <p className="text-base text-[#5F6368] mt-4 max-w-md mx-auto">
          Free during beta. No payment required. Create your study project in
          under 2 minutes.
        </p>
        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          <PrimaryButtonLink href="/projects/new">
            Create your study project →
          </PrimaryButtonLink>
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
    <footer className="w-full bg-white border-t border-[#E1E3E1] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <LogoMark />
            <p className="text-sm text-[#5F6368] mt-3 max-w-xs">
              AI-powered exam training workspace. Built for students who take
              their exams seriously.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#80868B] mb-3">
              Product
            </p>
            <ul className="space-y-2">
              {productLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#5F6368] hover:text-[#1F1F1F] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#5F6368] hover:text-[#1F1F1F] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#E1E3E1] flex justify-between items-center flex-wrap gap-4">
          <p className="text-xs text-[#80868B]">
            © 2026 Ivvy. All rights reserved.
          </p>
          <p className="text-xs text-[#80868B]">
            Built for exam-day training, not generic Q&amp;A.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white text-[#1F1F1F] min-h-screen">
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
