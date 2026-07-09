"use client";

import Sidebar from "~/components/client/sidebar";
import { ServiceCard } from "~/components/client/rajshahi/service-card";
import { PadmaBank } from "~/components/client/rajshahi/padma-bank";
import { useAudioStore } from "~/stores/audio-store";
import Playbar from "~/components/client/playbar";

const techStack = [
  { name: "Kokoro ONNX", desc: "Neural TTS" },
  { name: "Faster-Whisper", desc: "Speech recognition" },
  { name: "Ollama", desc: "Local LLM" },
  { name: "FFmpeg", desc: "Media processing" },
];

export default function AppHomePage() {
  const { currentAudio } = useAudioStore();

  return (
    <PadmaBank variant="full">
      <div className="flex h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden bg-brand-cream/70">
          {/* Unified header — brand left, status right */}
          <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border/70 bg-white/70 backdrop-blur-sm px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-maroon text-[11px] font-bold text-white">
                RV
              </span>
              <span className="text-sm font-medium text-text-primary">
                Rajshahi Voice Studio
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-3 py-1 text-[11px] font-medium text-brand-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" />
              All systems online
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-20 lg:px-12 xl:px-20">
              {/* Hero */}
              <div className="mb-20 max-w-3xl">
                <p className="mb-5 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-brand-mustard/80">
                  <span lang="bn">রাজশাহী</span>
                  <span className="h-3 w-px bg-brand-mustard/30" />
                  Made in Rajshahi
                </p>
                <h2 className="text-5xl font-bold leading-tight tracking-tighter text-text-primary md:text-6xl lg:text-7xl">
                  Local AI tools,
                  <br />
                  <span className="bg-gradient-to-r from-brand-maroon via-brand-mustard to-text-primary bg-clip-text text-transparent">
                    powered by the Padma
                  </span>
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary">
                  Professional voice synthesis, video transcription, and
                  short-form content generation — running entirely on your
                  machine. Zero API costs, zero data leaving your computer.
                </p>
              </div>

              {/* Service Cards */}
              <div className="mb-20 grid gap-6 lg:grid-cols-3">
                <ServiceCard
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                      <path d="M12 18.5A6.5 6.5 0 0 0 18.5 12M12 18.5A6.5 6.5 0 0 1 5.5 12M12 18.5v3M8 21.5h8" />
                      <circle cx="12" cy="6" r="4" />
                    </svg>
                  }
                  title="Text to Speech"
                  description="Natural voiceovers using Kokoro ONNX. 20+ voice presets across 5 languages with smart script optimization."
                  href="/app/speech-synthesis/text-to-speech"
                  status="ready"
                />
                <ServiceCard
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  }
                  title="Video Summarizer"
                  description="Transcribe and summarize YouTube videos or local files. Get concise summaries in your preferred language."
                  href="/app/video-summarizer"
                  status="soon"
                />
                <ServiceCard
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                      <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                      <circle cx="18" cy="18" r="3" />
                      <path d="M21 21l1.5 1.5" />
                    </svg>
                  }
                  title="Audiobook"
                  description="Turn books, articles, and long-form text into narrated audiobooks with chapter navigation and smart prosody."
                  href="/app/audiobook"
                  status="ready"
                />
              </div>

              {/* Tech stack */}
              <div className="border-t border-border/50 pt-10">
                <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.15em] text-text-tertiary">
                  Powered by
                </p>
                <div className="flex flex-wrap gap-3">
                  {techStack.map((tech) => (
                    <div
                      key={tech.name}
                      className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-white/60 px-3.5 py-2 text-xs text-text-secondary"
                    >
                      <span className="font-medium text-text-primary">{tech.name}</span>
                      <span className="text-text-tertiary">·</span>
                      <span>{tech.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {currentAudio && (
            <div className="flex-shrink-0">
              <Playbar />
            </div>
          )}
        </div>
      </div>
    </PadmaBank>
  );
}
