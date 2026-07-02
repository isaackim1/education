import Link from "next/link";
import ProductPreview from "@/components/marketing/ProductPreview";
import ReviewMoment from "@/components/marketing/ReviewMoment";
import { Reveal } from "@/components/ui/motion";

/**
 * Landing — why Ivvy exists, in one calm scroll.
 *
 * Six sections: hero, how it works, the training loop, why not just a chatbot,
 * two weeks with Ivvy, final call. One accent (forest), one CTA label
 * ("Start preparing"), no images: the product previews are the real UI
 * composition at reduced scale.
 */

const primaryCta =
  "inline-flex h-11 items-center justify-center rounded-md bg-[#1E4634] px-6 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#16382A] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

const secondaryCta =
  "inline-flex h-11 items-center justify-center rounded-md border border-[#D8D3C8] px-6 text-sm font-medium text-[#1A1A17] transition-colors duration-200 hover:bg-[#EFEBE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

function BrandMark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
    >
      <span className="grid h-8 w-8 place-items-center rounded-md bg-[#1E4634] text-sm font-medium text-white">
        I
      </span>
      <span className="text-[18px] font-medium tracking-[-0.01em] text-[#1A1A17]">
        Ivvy
      </span>
    </Link>
  );
}

const STEPS = [
  {
    title: "Upload",
    body: "Notes, slides, PDFs, and past papers. Everything the exam draws from goes in once.",
  },
  {
    title: "Ivvy organizes",
    body: "Your materials become a topic map. You review it and approve it before anything is saved.",
  },
  {
    title: "Train daily",
    body: "Ivvy quizzes you, saves your mistakes, and brings each one back exactly when it is due.",
  },
];

const JOURNEY = [
  { when: "Day 1", what: "Upload your materials. Approve the topic map." },
  { when: "Day 2", what: "First training session. Four mistakes saved." },
  { when: "Week 1", what: "Reviews come due. Weak topics surface." },
  { when: "Week 2", what: "Calibration shows where you are overconfident." },
  { when: "Exam week", what: "Review queue only. Everything lands before the date." },
];

export default function LandingPage() {
  return (
    <div className="relative isolate min-h-[100dvh] bg-[#FAF8F4] text-[#1A1A17]">
      <div className="ambient-wash" aria-hidden="true" />

      {/* Nav */}
      <header className="relative z-10 border-b border-[#E7E3DA]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <BrandMark />
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium text-[#56524B] transition-colors duration-200 hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center rounded-md bg-[#1E4634] px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#16382A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
            >
              Start preparing
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* S1 · Hero — stacked center, product preview rising from the fold */}
        <section className="mx-auto max-w-6xl px-5 pt-20 sm:px-8 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]">
              Exam preparation
            </p>
            <h1 className="mt-4 text-[40px] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[56px]">
              Your materials. Your mistakes. Your coach.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#56524B] sm:text-[17px]">
              Ivvy turns your exam materials into a coach that trains you,
              remembers your mistakes, and plans your next session.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className={primaryCta}>
                Start preparing
              </Link>
              <a href="#how-it-works" className={secondaryCta}>
                How it works
              </a>
            </div>
          </div>

          <Reveal className="mx-auto mt-16 max-w-4xl">
            <ProductPreview />
          </Reveal>
        </section>

        {/* S2 · How it works — three columns on rules, verbs as labels */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-10 px-5 pt-28 sm:px-8 sm:pt-36"
        >
          <div className="border-y border-[#E7E3DA]">
            <div className="grid gap-px bg-[#E7E3DA] md:grid-cols-3">
              {STEPS.map((step, index) => (
                <Reveal key={step.title} delay={index * 80}>
                  <div className="h-full bg-[#FAF8F4] px-2 py-12 md:px-8">
                    <h2 className="text-[20px] font-medium tracking-[-0.01em]">
                      {step.title}
                    </h2>
                    <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-[#56524B]">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* S3 · The training loop — real review moment + mistake memory */}
        <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-36">
          <div className="grid items-center gap-12 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <ReviewMoment />
            </Reveal>
            <Reveal delay={120} className="lg:col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]">
                Mistake memory
              </p>
              <h2 className="mt-3 text-[28px] font-medium leading-tight tracking-[-0.01em] sm:text-[32px]">
                Miss a question, and Ivvy schedules its return.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#56524B]">
                Tomorrow, then next week, until it stays right. Before each
                answer you say how sure you are. Feeling certain and being
                wrong is exactly what Ivvy hunts for.
              </p>
            </Reveal>
          </div>
        </section>

        {/* S4 · Why not just a chatbot — typographic diptych */}
        <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[28px] font-medium leading-tight tracking-[-0.01em] sm:text-[36px]">
              ChatGPT answers questions.{" "}
              <span className="text-[#1E4634]">Ivvy trains you.</span>
            </h2>
          </div>
          <Reveal className="mx-auto mt-12 max-w-4xl">
            <div className="grid border-t border-[#E7E3DA] md:grid-cols-2">
              <div className="border-b border-[#E7E3DA] py-8 pr-0 md:border-b-0 md:border-r md:pr-10">
                <h3 className="text-[15px] font-medium">A chatbot</h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#56524B]">
                  <li>Answers what you ask, then forgets you.</li>
                  <li>Knows the internet, not your course.</li>
                  <li>Sounds confident whether or not you are.</li>
                </ul>
              </div>
              <div className="py-8 pl-0 md:pl-10">
                <h3 className="text-[15px] font-medium">A coach</h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#56524B]">
                  <li>Works from your notes, slides, and past papers.</li>
                  <li>Remembers every mistake and when it is due back.</li>
                  <li>Notices when you feel sure and answer wrong.</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        {/* S5 · Two weeks with Ivvy — horizontal timeline */}
        <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-36">
          <h2 className="text-center text-[28px] font-medium leading-tight tracking-[-0.01em] sm:text-[32px]">
            Two weeks with Ivvy
          </h2>
          <Reveal className="mt-14">
            <ol className="relative grid gap-10 md:grid-cols-5 md:gap-6">
              <span
                className="absolute left-0 right-0 top-[3px] hidden h-px bg-[#E7E3DA] md:block"
                aria-hidden="true"
              />
              {JOURNEY.map((stop) => (
                <li key={stop.when} className="relative md:pt-6">
                  <span
                    className="absolute left-0 top-0 hidden h-[7px] w-[7px] rounded-full bg-[#1E4634] md:block"
                    aria-hidden="true"
                  />
                  <p className="text-[13px] font-medium text-[#1E4634]">
                    {stop.when}
                  </p>
                  <p className="mt-1.5 max-w-[26ch] text-[14px] leading-relaxed text-[#56524B]">
                    {stop.what}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* S6 · Final call — mini minimalist */}
        <section className="mx-auto max-w-6xl px-5 py-32 text-center sm:px-8 sm:py-40">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-[28px] font-medium leading-tight tracking-[-0.01em] sm:text-[36px]">
              Your exam has a date. Start training for it.
            </h2>
            <div className="mt-8 flex justify-center">
              <Link href="/signup" className={primaryCta}>
                Start preparing
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#E7E3DA]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <BrandMark />
          <Link
            href="/login"
            className="text-sm font-medium text-[#56524B] transition-colors hover:text-[#1A1A17]"
          >
            Log in
          </Link>
        </div>
      </footer>
    </div>
  );
}
