import Link from "next/link";

export function ServiceCard({
  icon,
  title,
  description,
  href,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  status: "ready" | "soon";
}) {
  return (
    <Link
      href={status === "ready" ? href : "#"}
      className={`group relative flex flex-col rounded-xl border bg-white/70 p-6 backdrop-blur-sm transition-all hover:shadow-md hover:bg-white/90 ${
        status === "ready"
          ? "border-border hover:border-gray-300"
          : "border-dashed border-border/60 cursor-default"
      }`}
      tabIndex={status === "ready" ? undefined : -1}
    >
      {status === "soon" && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
          Coming soon
        </span>
      )}

      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${
          status === "ready"
            ? "bg-gray-900 text-white group-hover:bg-gray-800"
            : "bg-gray-100 text-gray-400"
        } transition-colors`}
      >
        {icon}
      </div>

      <h3 className="mb-2 text-base font-semibold text-text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>

      <div className="mt-auto pt-4">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            status === "ready"
              ? "text-gray-900 group-hover:gap-1.5"
              : "text-text-tertiary"
          } transition-all`}
        >
          {status === "ready" ? "Open" : "Coming soon"}
          {status === "ready" && (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </span>
      </div>
    </Link>
  );
}
