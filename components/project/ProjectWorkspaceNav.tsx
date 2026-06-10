import Link from "next/link";

type WorkspaceNavItem =
  | "overview"
  | "setup"
  | "materials"
  | "chat"
  | "mistakes"
  | "review";

const NAV_ITEMS: { id: WorkspaceNavItem; label: string; suffix: string }[] = [
  { id: "overview", label: "Overview", suffix: "" },
  { id: "setup", label: "Topics", suffix: "/setup" },
  { id: "materials", label: "Materials", suffix: "/materials" },
  { id: "chat", label: "Chat", suffix: "/chat" },
  { id: "mistakes", label: "Mistakes", suffix: "/mistakes" },
  { id: "review", label: "Review", suffix: "/review" },
];

export default function ProjectWorkspaceNav({
  projectId,
  active,
}: {
  projectId: string;
  active: WorkspaceNavItem;
}) {
  const base = `/projects/${projectId}`;

  return (
    <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E1E3E1] pb-4 mb-6">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 sm:flex-wrap sm:overflow-visible">
        {NAV_ITEMS.map((item) => {
          const href = `${base}${item.suffix}`;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center h-9 px-4 rounded-full text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-[#E8EAED] text-[#1F1F1F] font-medium"
                  : "text-[#5F6368] hover:bg-[#F1F3F4] hover:text-[#1F1F1F]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/projects"
        className="inline-flex items-center h-9 px-3 rounded-full text-sm text-[#5F6368] shrink-0 transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
      >
        Back to projects
      </Link>
    </nav>
  );
}
