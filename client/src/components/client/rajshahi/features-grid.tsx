"use client";

const features = [
  {
    title: "Zero API Costs",
    description:
      "Everything runs locally on your machine. No subscriptions, no per-character fees, no surprise bills.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path d="M12 6v12m-3-2.818.879.659 1.171-1.671 1.171 1.671.879-.659" />
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
      </svg>
    ),
  },
  {
    title: "20+ Voice Presets",
    description:
      "Choose from a curated library of neural voices across multiple genders, ages, and speaking styles.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    title: "Bangla & English",
    description:
      "Full support for Bangla and English with natural prosody. Additional languages coming soon.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1m6 22h5a2 2 0 0 0 2-2V7.5M21 12a2 2 0 0 0-2-2h-1M3 12v6a2 2 0 0 0 2 2h4" />
      </svg>
    ),
  },
  {
    title: "Local Processing",
    description:
      "Your voice data never leaves your computer. Complete privacy for sensitive content.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: "Smart Prosody",
    description:
      "AI-powered punctuation and emphasis detection for natural-sounding speech.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
  {
    title: "Offline First",
    description:
      "Works without internet after initial setup. Perfect for travel or unreliable connections.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
];

export function FeaturesGrid() {
  return (
    <section className="bg-brand-cream/50 py-20 lg:py-28" id="features">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-emerald">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Built for developers,
            <br />
            designed for everyone
          </h2>
          <p className="mt-4 text-base text-text-secondary">
            Everything you need to generate professional voice content, without
            the complexity or cost of cloud services.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-emerald/10 text-brand-emerald transition-colors group-hover:bg-brand-emerald group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-[15px] font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
