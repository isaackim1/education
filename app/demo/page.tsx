import type { Metadata } from "next";
import {
  DuButton,
  DuCard,
  DuShell,
  DuTag,
  Eyebrow,
  SectionTitle,
} from "@/components/du/ui";
import DemoGuide from "@/components/du/DemoGuide";
import { getKnowledgeByModule } from "@/lib/du/knowledge";
import { KNOWLEDGE_SOURCES } from "@/data/unknown/effectuation-knowledge";

export const metadata: Metadata = {
  title: "Indy Unknown Alpha — Partner Demo",
  description:
    "A digital university for founders who build from day one. What this alpha proves, and how to demo it in five minutes.",
};

const PROVES: { title: string; detail: string }[] = [
  {
    title: "Unknown-style knowledge can become a digital module",
    detail:
      "An entrepreneurship philosophy becomes a structured, applied learning journey — not a video library.",
  },
  {
    title: "Founders can work at their own pace",
    detail:
      "Founders move through learn → apply → submit → revise on their own schedule, with progress that persists.",
  },
  {
    title: "AI feed-forward supports — it does not replace — human mentors",
    detail:
      "The AI sharpens a founder's working draft before mentor review. Final judgment stays with your experts.",
  },
  {
    title: "Founder progress can be tracked across revisions",
    detail:
      "Every draft is snapshotted, so you can see how a venture sharpened from Draft 1 to mentor-ready.",
  },
  {
    title: "It can scale into a full digital university",
    detail:
      "One module proves the spine: more modules, more cohorts, and real transcripts slot into the same architecture.",
  },
];

const DEMO_PATH: string[] = [
  "Start at Campus",
  "Open the Effectuation Roadmap module",
  "Use the demo venture",
  "Complete the roadmap in Venture Studio",
  "Generate feed-forward",
  "Review the Progress Journey",
  "Ask the mentor a follow-up",
];

const FIVE_MINUTE: string[] = [
  "Open Campus",
  'Click "Use demo venture"',
  "Show the Effectuation module overview",
  "Open Venture Studio (the roadmap is pre-filled)",
  "Generate feed-forward",
  "Show the Review Room (feed-forward, not a grade)",
  "Show the Progress Journey across the milestones",
  'Ask the mentor: "Challenge my assumptions before mentor review"',
];

export default function DemoPage() {
  const chunkCount = getKnowledgeByModule("effectuation").length;
  const sourceLabels = KNOWLEDGE_SOURCES.map((s) => s.sourceLabel);

  return (
    <DuShell>
      {/* Hero */}
      <DuCard tone="ink" className="overflow-hidden">
        <Eyebrow onDark>Indy Unknown Alpha · Partner demo</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl">
          A digital university for founders who{" "}
          <span className="bg-[#F5D11E] px-2 text-[#0B0B0C]">
            build from day one
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/75">
          Indy Unknown Alpha turns an entrepreneurship module into a guided
          digital learning journey: learn, apply, submit, receive feed-forward,
          revise, reflect, and prepare for mentor review. It&apos;s built to feel
          like the digital version of an applied, founder-first university.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <DuButton href="/campus" variant="accent">
            Start demo →
          </DuButton>
          <DuButton
            href="/module/effectuation/studio"
            variant="outline"
            className="border-white/30 text-white hover:bg-white hover:text-[#0B0B0C]"
          >
            Open Venture Studio
          </DuButton>
          <DuButton
            href="/module/effectuation"
            variant="outline"
            className="border-white/30 text-white hover:bg-white hover:text-[#0B0B0C]"
          >
            View Knowledge Brain
          </DuButton>
        </div>
      </DuCard>

      {/* What this proves */}
      <div className="mt-10">
        <SectionTitle
          eyebrow="What this proves"
          title="Five things this alpha demonstrates"
          description="Not a finished product — a working proof that the model holds."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {PROVES.map((item, i) => (
            <DuCard key={i}>
              <div className="flex items-start gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center bg-[#F5D11E] text-sm font-black text-[#0B0B0C]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-black tracking-tight text-[#0B0B0C]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#56524B]">
                    {item.detail}
                  </p>
                </div>
              </div>
            </DuCard>
          ))}
        </div>
      </div>

      {/* Demo path + guided journey */}
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <DuCard>
          <SectionTitle eyebrow="Demo path" title="The journey, end to end" />
          <ol className="space-y-2.5">
            {DEMO_PATH.map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#EDE8DA] text-xs font-black text-[#56524B]">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-[#3A372F]">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </DuCard>

        <DemoGuide title="Pick up where the demo is" />
      </div>

      {/* Suggested 5-minute demo */}
      <div className="mt-10">
        <DuCard tone="ink">
          <Eyebrow onDark>Suggested 5-minute demo</Eyebrow>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            Run it in five minutes
          </h2>
          <ol className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {FIVE_MINUTE.map((step, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#F5D11E] text-xs font-black text-[#0B0B0C]">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-white/85">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <DuButton href="/campus" variant="accent">
              Start at Campus →
            </DuButton>
          </div>
        </DuCard>
      </div>

      {/* Knowledge Brain — founder-friendly */}
      <div className="mt-10">
        <SectionTitle
          eyebrow="Unknown Knowledge Brain"
          title="Your educational philosophy becomes the source of the AI coach"
        />
        <DuCard>
          <p className="text-[15px] leading-relaxed text-[#3A372F]">
            The mentor and feed-forward don&apos;t speak from generic AI training.
            They&apos;re grounded in a local <strong>Unknown Knowledge Brain</strong> —
            curated module concepts and source labels that shape every response.
            Today that brain holds <strong>{chunkCount} knowledge chunks</strong> for the
            Effectuation Roadmap module. Tomorrow it can ingest your real
            transcripts, knowledge clips, and recordings — the retrieval
            architecture is already real, not a mockup.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {sourceLabels.map((label) => (
              <DuTag key={label}>{label}</DuTag>
            ))}
          </div>
        </DuCard>
      </div>

      {/* Human mentor protected */}
      <div className="mt-6">
        <DuCard tone="yellow">
          <Eyebrow>Human mentors stay central</Eyebrow>
          <p className="mt-2 max-w-3xl text-[15px] font-semibold leading-relaxed text-[#0B0B0C]">
            AI feed-forward helps founders improve a working draft before mentor
            review. It does not grade, score, or replace human mentors, final
            assessment, or expert judgment. The digital journey gets founders
            further along — so your experts spend their time on the highest-value
            conversations.
          </p>
        </DuCard>
      </div>

      {/* Closing CTAs */}
      <div className="mt-10 flex flex-wrap gap-3">
        <DuButton href="/campus" variant="primary">
          Start demo
        </DuButton>
        <DuButton href="/module/effectuation/studio" variant="outline">
          Open Venture Studio
        </DuButton>
        <DuButton href="/module/effectuation" variant="outline">
          View Knowledge Brain
        </DuButton>
      </div>
    </DuShell>
  );
}
