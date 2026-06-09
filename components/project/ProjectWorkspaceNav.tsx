import Link from "next/link";

type WorkspaceNavItem = "overview" | "setup" | "materials";

const NAV_ITEMS: { id: WorkspaceNavItem; label: string; suffix: string }[] = [
  { id: "overview", label: "Overview", suffix: "" },
  { id: "setup", label: "Topics", suffix: "/setup" },
  { id: "materials", label: "Materials", suffix: "/materials" },
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
    <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => {
          const href = `${base}${item.suffix}`;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              href={href}
              className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                isActive
                  ? "border-black text-black bg-neutral-50"
                  : "border-transparent text-neutral-500 hover:text-black hover:border-neutral-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/projects"
        className="text-sm text-neutral-500 hover:text-black transition-colors"
      >
        Back to projects
      </Link>
    </nav>
  );
}
