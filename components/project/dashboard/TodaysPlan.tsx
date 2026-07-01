import Link from "next/link";
import { Eyebrow, primaryAction } from "@/components/ui/primitives";
import type {
  TodaysPlanAction,
  TodaysPlanMetrics,
} from "@/lib/dashboard-metrics";

function SecondaryAction({ action }: { action: TodaysPlanAction }) {
  return (
    <Link
      href={action.href}
      className="block rounded-xl border border-[#E7E3DA] bg-white px-4 py-3 transition-colors hover:bg-[#FAF8F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
    >
      <span className="text-sm font-medium text-[#1A1A17]">{action.title}</span>
      <span className="mt-1 block text-xs text-[#56524B]">
        {action.description}
      </span>
    </Link>
  );
}

export default function TodaysPlan({ plan }: { plan: TodaysPlanMetrics }) {
  return (
    <section className="h-full rounded-xl border border-[#D8D3C8] bg-[#EFEBE2] p-6 sm:p-8">
      <Eyebrow>Today&apos;s training plan</Eyebrow>
      <div className="mt-3">
        <h2 className="font-serif text-[25px] leading-tight tracking-[-0.02em] text-[#1A1A17]">
          {plan.primary.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
          {plan.primary.description}
        </p>
        <Link href={plan.primary.href} className={`${primaryAction} mt-4`}>
          {plan.primary.title}
        </Link>
      </div>

      {plan.secondary.length > 0 ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {plan.secondary.map((action) => (
            <SecondaryAction key={`${action.href}-${action.title}`} action={action} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
