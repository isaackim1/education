import Link from "next/link";
import DemoChat from "@/components/marketing/DemoChat";

const primaryCta =
  "inline-flex h-11 items-center justify-center rounded-full bg-[#1A1A17] px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

const secondaryCta =
  "inline-flex h-11 items-center justify-center rounded-full border border-[#D8D3C8] px-6 text-sm font-medium text-[#1A1A17] transition-colors duration-200 hover:bg-[#EFEBE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]">
      {children}
    </p>
  );
}

function LogoMark() {
  return (
    <Link
      href="/home"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1A1A17] font-serif text-sm text-white">
        I
      </span>
      <span className="font-serif text-[19px] tracking-[-0.01em] text-[#1A1A17]">
        Ivvy
      </span>
    </Link>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E7E3DA] bg-[#FAF8F4]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <LogoMark />
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#demo"
            className="text-sm font-medium text-[#56524B] transition-colors hover:text-[#1A1A17]"
          >
            Try the tutor
          </a>
          <a
            href="#how"
            className="text-sm font-medium text-[#56524B] transition-colors hover:text-[#1A1A17]"
          >
            How it works
          </a>
          <a
            href="#system"
            className="text-sm font-medium text-[#56524B] transition-colors hover:text-[#1A1A17]"
          >
            The system
          </a>
        </div>
        <Link href="/projects" className={primaryCta}>
          Open workspace
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="w-full border-b border-[#E7E3DA]">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="flex flex-col justify-center lg:col-span-7">
          <Eyebrow>AI exam training workspace</Eyebrow>
          <h1 className="mt-5 font-serif text-[44px] leading-[1.04] tracking-[-0.02em] text-[#1A1A17] sm:text-[60px]">
            Your exam materials, turned into a personal AI trainer.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#56524B]">
            Upload your notes once. Ivvy extracts your topics, organizes the
            material into a training map, and drills you on exactly what your
            exam tests — not generic study chat.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/projects" className={primaryCta}>
              Open workspace
            </Link>
            <a href="#demo" className={secondaryCta}>
              Try the tutor
            </a>
          </div>
          <p className="mt-6 text-sm text-[#7A766D]">
            Built for GMAT, Bar, USMLE, CFA, university finals, and resits.
          </p>
        </div>

        {/* Editorial product still — the training map */}
        <div className="lg:col-span-5 lg:pl-4">
          <div className="rounded-2xl border border-[#E7E3DA] bg-white p-6 shadow-[0_1px_0_rgba(26,26,23,0.04)]">
            <div className="flex items-center justify-between">
              <Eyebrow>Training map</Eyebrow>
              <span className="inline-flex items-center rounded-full bg-[#E7F0E9] px-2.5 py-1 text-xs font-medium text-[#137333]">
                Exam-ready
              </span>
            </div>
            <ul className="mt-5 divide-y divide-[#EFEBE2]">
              {[
                { topic: "Monetary policy", state: "Trained" },
                { topic: "Fiscal multipliers", state: "In progress" },
                { topic: "Exchange rates", state: "Needs work" },
                { topic: "Inflation & unemployment", state: "Trained" },
              ].map((row) => (
                <li
                  key={row.topic}
                  className="flex items-center justify-between py-3.5"
                >
                  <span className="font-serif text-[17px] tracking-[-0.01em] text-[#1A1A17]">
                    {row.topic}
                  </span>
                  <span className="text-xs font-medium text-[#7A766D]">
                    {row.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="w-full border-b border-[#E7E3DA] bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>Try the tutor</Eyebrow>
          <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-[-0.01em] text-[#1A1A17] sm:text-[40px]">
            Ask a question. See how Ivvy teaches.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#56524B]">
            This is a quick preview — a few free questions, no sign-up. The full
            tutor trains you on your own materials, saves your mistakes, and
            tracks your readiness for exam day.
          </p>
        </div>
        <div className="lg:col-span-7">
          <DemoChat />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Upload once",
      body: "Paste notes or drop in PDFs, documents, and past papers. One upload, not a dozen forms.",
    },
    {
      n: "02",
      title: "Ivvy organizes",
      body: "Ivvy extracts your topics and sorts every piece of material into a training map you review before saving.",
    },
    {
      n: "03",
      title: "Train actively",
      body: "Practice exam-style questions and teach topics back. Ivvy adapts to your answers and finds the gaps.",
    },
    {
      n: "04",
      title: "Review mistakes",
      body: "Flagged mistakes are saved to a mistake bank and resurfaced until you've genuinely closed the gap.",
    },
    {
      n: "05",
      title: "Track progress",
      body: "A command-center dashboard shows readiness, weak topics, and what to train next as your exam approaches.",
    },
  ];

  return (
    <section id="how" className="w-full border-b border-[#E7E3DA]">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Eyebrow>The loop</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-serif text-[32px] leading-tight tracking-[-0.01em] text-[#1A1A17] sm:text-[40px]">
          From scattered materials to focused training.
        </h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[#E7E3DA] bg-[#E7E3DA] sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col bg-[#FAF8F4] p-6">
              <span className="font-serif text-[15px] text-[#A8A299] tabular-nums">
                {step.n}
              </span>
              <h3 className="mt-3 font-serif text-[20px] tracking-[-0.01em] text-[#1A1A17]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PositioningQuote() {
  return (
    <section className="w-full border-b border-[#E7E3DA] bg-white">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <p className="font-serif text-[28px] leading-snug tracking-[-0.01em] text-[#1A1A17] sm:text-[34px]">
          &ldquo;Claude answers your study questions. Ivvy trains you for the
          exam.&rdquo;
        </p>
        <p className="mt-5 text-[15px] leading-relaxed text-[#56524B]">
          Every screen points toward practice, correction, and exam readiness —
          a calm training environment built on your own materials.
        </p>
      </div>
    </section>
  );
}

function StudySystem() {
  const modes = [
    {
      title: "Training map",
      body: "Your materials become a structured map of topics — the backbone every study mode trains against.",
    },
    {
      title: "Active questions",
      body: "Guided, exam-style questions with feedback. Wrong answers flow straight into your mistake bank.",
    },
    {
      title: "Teach Back",
      body: "Explain a topic in your own words and let Ivvy find the gaps in your understanding.",
    },
    {
      title: "Study Sheet",
      body: "Turn a topic's material into a structured, exam-ready summary in one click.",
    },
    {
      title: "Mistake bank",
      body: "Flagged mistakes are saved and resurfaced until you've genuinely closed the gap.",
    },
    {
      title: "Progress dashboard",
      body: "A command center for readiness, weak topics, training activity, and what to do next.",
    },
  ];

  return (
    <section id="system" className="w-full border-b border-[#E7E3DA]">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <Eyebrow>One coherent system</Eyebrow>
          <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-[-0.01em] text-[#1A1A17] sm:text-[40px]">
            More than a chat. A study operating system.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#56524B]">
            Six modules work from the same topic map and materials, so every
            session builds on the last.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((mode) => (
            <div
              key={mode.title}
              className="rounded-2xl border border-[#E7E3DA] bg-white p-6"
            >
              <h3 className="font-serif text-[20px] tracking-[-0.01em] text-[#1A1A17]">
                {mode.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
                {mode.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="w-full border-b border-[#E7E3DA] bg-white">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <h2 className="font-serif text-[34px] leading-tight tracking-[-0.01em] text-[#1A1A17] sm:text-[44px]">
          Start preparing today.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#56524B]">
          Open your workspace and turn your first set of materials into a
          training map in minutes.
        </p>
        <div className="mt-9 flex justify-center gap-3">
          <Link href="/signup" className={primaryCta}>
            Start with your materials
          </Link>
          <Link href="/projects" className={secondaryCta}>
            Open workspace
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-[#FAF8F4]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-12 sm:flex-row sm:items-center sm:px-8">
        <LogoMark />
        <p className="text-xs text-[#7A766D]">
          Built for exam-day training, not generic Q&amp;A.
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1A1A17]">
      <Nav />
      <Hero />
      <DemoSection />
      <HowItWorks />
      <PositioningQuote />
      <StudySystem />
      <FinalCta />
      <Footer />
    </div>
  );
}
