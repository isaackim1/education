/**
 * ReviewMoment — a static render of the Coach review interaction, built from
 * the product's real visual language: the question block, the confidence step,
 * the calibration echo, and the schedule receipt. Sample data, non-interactive.
 */
export default function ReviewMoment() {
  return (
    <div
      role="img"
      aria-label="Preview of a Coach review: the student rates their confidence before checking, and Ivvy schedules the mistake's return"
      className="pointer-events-none select-none rounded-xl border border-[#E7E3DA] bg-white p-5 text-left shadow-[0_24px_80px_rgba(26,26,23,0.08)] sm:p-6"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A766D]">
        Review · Elasticities
      </p>
      <p className="mt-2.5 text-[15px] leading-relaxed text-[#1A1A17]">
        A good&apos;s price rises 10% and quantity demanded falls 4%. Is demand
        elastic or inelastic, and why?
      </p>

      <div className="mt-4 rounded-lg border border-[#E7E3DA] bg-[#FAF8F4] px-4 py-3">
        <p className="text-[13px] text-[#56524B]">
          Elastic, because quantity responded to the price change.
        </p>
      </div>

      <p className="mt-4 text-[12px] font-medium text-[#56524B]">
        Before I check, how sure are you?
      </p>
      <div className="mt-2 flex gap-2">
        <span className="inline-flex h-8 items-center rounded-md border border-[#D8D3C8] px-3.5 text-[12px] text-[#56524B]">
          Guessing
        </span>
        <span className="inline-flex h-8 items-center rounded-md border border-[#D8D3C8] px-3.5 text-[12px] text-[#56524B]">
          Fairly sure
        </span>
        <span className="inline-flex h-8 items-center rounded-md bg-[#1E4634] px-3.5 text-[12px] font-medium text-white">
          Certain
        </span>
      </div>

      <div className="mt-5 border-t border-[#EFEBE2] pt-4">
        <p className="text-[13px] leading-relaxed text-[#1A1A17]">
          Not quite. |0.4| is less than 1, so demand is inelastic: the quantity
          response was smaller than the price change.
        </p>
        <p className="mt-2 text-[12px] font-medium text-[#9C4126]">
          You were certain about this one.
        </p>
        <p className="mt-3 text-[12px] text-[#56524B]">
          Saved to your mistakes. Due back Friday, Jul 10.
        </p>
      </div>
    </div>
  );
}
