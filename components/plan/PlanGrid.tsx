import type { StudyPlan, Topic } from "@/lib/types";
import DayCard from "./DayCard";

interface PlanGridProps {
  plan: StudyPlan;
  topics: Topic[];
}

export default function PlanGrid({ plan, topics }: PlanGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {plan.days.map((day) => (
        <DayCard key={day.day} day={day} topics={topics} />
      ))}
    </div>
  );
}
