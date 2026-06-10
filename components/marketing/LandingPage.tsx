import Link from "next/link";

function CtaButton({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/projects/new"
      className="inline-flex items-center bg-black text-white text-sm font-medium px-6 py-3 rounded hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-black transition-colors"
    >
      {children}
    </Link>
  );
}

const HOW_IT_WORKS_STEPS = [
  {
    number: "1",
    title: "Build your training set",
    body: "Add your lecture notes, past papers, and marking criteria. Ivvy reads the material you give it.",
  },
  {
    number: "2",
    title: "Train in adaptive chat",
    body: "Ivvy asks exam-style questions. When you get something wrong, it catches the mistake and keeps training.",
  },
  {
    number: "3",
    title: "Close your gaps",
    body: "Every mistake goes into a mistake bank. Between sessions, Ivvy brings weak areas back into the next round of training.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <header className="max-w-2xl mx-auto px-4 py-6">
        <span className="text-sm font-medium text-black">Ivvy</span>
      </header>

      <main>
        <section className="max-w-2xl mx-auto px-4 py-16 sm:py-32">
          <p className="text-xs font-medium text-neutral-500">
            AI exam training
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-black mt-4">
            Your exam materials, turned into a personal AI trainer.
          </h1>
          <p className="text-sm text-neutral-600 mt-6">
            Claude answers your study questions. Ivvy trains you for the exam.
          </p>
          <div className="mt-8">
            <CtaButton>Start training →</CtaButton>
          </div>
        </section>

        <section className="max-w-2xl mx-auto px-4 py-20 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            Chatbots explain things. They answer questions, summarise notes, and
            generate practice questions on request. That is useful. But
            explaining is not training. Training is getting tested, failing, and
            being forced back to the concept until you can answer it under exam
            conditions. That is what Ivvy does.
          </p>
        </section>

        <section className="max-w-2xl mx-auto px-4 py-20 border-t border-neutral-200">
          <h2 className="text-sm font-semibold text-black">How it works</h2>
          <ol className="list-none space-y-6 mt-6">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <li key={step.number}>
                <p className="text-xs text-neutral-400">{step.number}</p>
                <h3 className="text-sm font-medium text-black mt-1">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600 mt-1">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="max-w-2xl mx-auto px-4 py-20 border-t border-neutral-200">
          <div className="border border-neutral-200 rounded p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-neutral-500">Ivvy</p>
              <p className="text-sm text-black mt-1">
                Explain the difference between demand-pull and cost-push
                inflation using a supply and demand diagram.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">You</p>
              <p className="text-sm text-black mt-1">
                When demand goes up, prices go up. That is demand-pull. Cost-push
                is when wages increase.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Ivvy</p>
              <span className="inline-block text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700 mt-1">
                Mistake: conceptual
              </span>
              <p className="text-sm text-black mt-2">
                Close, but incomplete. Demand-pull happens when aggregate demand
                exceeds aggregate supply at the current price level. The demand
                curve shifts right. Your answer described the result, not the
                cause.
              </p>
              <p className="text-sm text-black mt-2">
                Now answer this: what happens to the aggregate supply curve
                during cost-push inflation?
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            Ivvy caught a conceptual gap and retested immediately.
          </p>
        </section>

        <section className="max-w-lg mx-auto px-4 py-20 text-center border-t border-neutral-200">
          <h2 className="text-2xl font-semibold tracking-tight text-black">
            Ready to train?
          </h2>
          <p className="text-sm text-neutral-600 mt-4">
            Start with one exam project. Add your topics, paste your notes, and
            let Ivvy test what you actually need to know.
          </p>
          <div className="mt-8">
            <CtaButton>Start training →</CtaButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-xs text-neutral-400">
            Ivvy — built for exam training
          </p>
        </div>
      </footer>
    </div>
  );
}
