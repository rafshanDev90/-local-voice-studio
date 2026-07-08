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
      className={`group relative flex flex-col rounded-xl bg-white p-6 shadow-sm transition-all ${
        status === "ready"
          ? "border border-border/80 hover:shadow-md hover:-translate-y-0.5"
          : "border border-dashed border-border/60 cursor-default"
      }`}
      tabIndex={status === "ready" ? undefined : -1}
    >
      {status === "soon" && (
        <span className="absolute right-3 top-3 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-emerald border border-emerald-200/60">
          Coming soon
        </span>
      )}

      {status === "ready" && (
        <div className="absolute left-0 top-0 h-full w-0.5 rounded-l-xl bg-brand-maroon" />
      )}

      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
          status === "ready"
            ? "bg-brand-maroon text-white shadow-sm"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </div>

      <h3 className="mb-2 text-[15px] font-semibold text-text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>

      <div className="mt-auto pt-5">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium transition-all ${
            status === "ready"
              ? "text-brand-maroon group-hover:gap-2"
              : "text-text-tertiary"
          }`}
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
