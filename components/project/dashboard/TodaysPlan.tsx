import Link from "next/link";
import type {
  TodaysPlanAction,
  TodaysPlanMetrics,
} from "@/lib/dashboard-metrics";

const PRIMARY_LINK =
  "inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1A1A17] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

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
    <section className="rounded-2xl border border-[#D8D3C8] bg-[#EFEBE2] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#56524B]">
        Today&apos;s training plan
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight text-[#1A1A17]">
            {plan.primary.title}
          </h2>
          <p className="mt-1 text-sm text-[#56524B]">
            {plan.primary.description}
          </p>
        </div>
        <Link href={plan.primary.href} className={PRIMARY_LINK}>
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
