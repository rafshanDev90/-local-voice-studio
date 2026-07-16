"use client";

const stack = [
  {
    name: "Kokoro ONNX",
    desc: "Neural TTS",
    detail: "High-quality speech synthesis",
  },
  {
    name: "Edge-TTS",
    desc: "Bangla voices",
    detail: "Microsoft neural voices",
  },
  {
    name: "Faster-Whisper",
    desc: "Speech recognition",
    detail: "CTranslate2 optimized",
  },
  {
    name: "Ollama",
    desc: "Local LLM",
    detail: "Private text processing",
  },
  {
    name: "FFmpeg",
    desc: "Media processing",
    detail: "Audio/video conversion",
  },
];

export function TechStack() {
  return (
    <section className="border-t border-border/50 bg-white py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
              Powered by
            </p>
            <p className="text-sm text-text-secondary">
              Open-source technologies, running locally
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {stack.map((tech) => (
              <div
                key={tech.name}
                className="group relative inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface-secondary px-4 py-2.5 transition-all hover:border-brand-mustard/30 hover:bg-brand-mustard/5"
              >
                <span className="text-sm font-medium text-text-primary">
                  {tech.name}
                </span>
                <span className="text-text-tertiary">·</span>
                <span className="text-xs text-text-tertiary">{tech.desc}</span>

                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-text-primary px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {tech.detail}
                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-text-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
