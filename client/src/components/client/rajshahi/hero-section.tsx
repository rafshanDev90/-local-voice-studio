"use client";

import { useEffect, useState } from "react";

const stats = [
  { label: "Voice Presets", value: 20, suffix: "+" },
  { label: "Languages", value: 5, suffix: "" },
  { label: "API Cost", value: 0, suffix: "$", prefix: true },
];

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-cream via-white to-brand-cream/50">
      {/* Background waveform decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        <div className="absolute bottom-0 left-0 right-0 flex h-64 items-end justify-center gap-1 pb-8">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-brand-maroon"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-12 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-mustard/20 bg-brand-mustard/5 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald animate-pulse-dot" />
            <span className="text-xs font-medium text-brand-mustard">
              <span lang="bn">রাজশাহী</span> · Made in Rajshahi
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-text-primary md:text-6xl lg:text-7xl">
            Local AI tools,
            <br />
            <span className="bg-gradient-to-r from-brand-maroon via-brand-mustard to-brand-emerald bg-clip-text text-transparent">
              powered by the Padma
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-text-secondary">
            Professional voice synthesis, video transcription, and short-form
            content generation — running entirely on your machine. Zero API
            costs, zero data leaving your computer.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a
              href="/app/speech-synthesis/text-to-speech"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-maroon px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand-maroon/20 transition-all hover:shadow-xl hover:shadow-brand-maroon/30 hover:-translate-y-0.5"
            >
              Try Text-to-Speech
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/60 px-6 py-3 text-sm font-medium text-text-primary transition-all hover:bg-white hover:shadow-sm"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap gap-8 border-t border-border/50 pt-10 lg:mt-24">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-3xl font-bold text-text-primary">
                {stat.prefix ? stat.suffix : null}
                {stat.value}
                {!stat.prefix ? stat.suffix : null}
              </div>
              <div className="mt-1 text-sm text-text-tertiary">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
