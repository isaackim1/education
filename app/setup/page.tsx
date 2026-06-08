import ExamForm from "@/components/setup/ExamForm";

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">StudyCoach</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Set up your exam and build a 2-week study plan.
          </p>
        </header>
        <ExamForm />
      </div>
    </main>
  );
}
