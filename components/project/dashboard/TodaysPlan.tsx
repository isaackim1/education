import Link from "next/link";
import type {
  TodaysPlanAction,
  TodaysPlanMetrics,
} from "@/lib/dashboard-metrics";

const PRIMARY_LINK =
  "inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

function SecondaryAction({ action }: { action: TodaysPlanAction }) {
  return (
    <Link
      href={action.href}
      className="block rounded-xl border border-[#E1E3E1] bg-white px-4 py-3 transition-colors hover:bg-[#F8FAFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
    >
      <span className="text-sm font-medium text-[#1F1F1F]">{action.title}</span>
      <span className="mt-1 block text-xs text-[#5F6368]">
        {action.description}
      </span>
    </Link>
  );
}

export default function TodaysPlan({ plan }: { plan: TodaysPlanMetrics }) {
  return (
    <section className="rounded-2xl border border-[#DADCE0] bg-[#F1F3F4] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#5F6368]">
        Today&apos;s training plan
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight text-[#1F1F1F]">
            {plan.primary.title}
          </h2>
          <p className="mt-1 text-sm text-[#5F6368]">
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
