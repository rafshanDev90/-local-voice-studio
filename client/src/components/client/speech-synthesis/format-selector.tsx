"use client";

import { type AudioFormat, useAudioConfig } from "~/stores/audio-config";

const FORMATS: { value: AudioFormat; label: string; desc: string }[] = [
  { value: "wav", label: "WAV", desc: "Lossless" },
  { value: "mp3", label: "MP3", desc: "Compressed" },
  { value: "ogg", label: "OGG", desc: "Vorbis" },
  { value: "flac", label: "FLAC", desc: "Lossless" },
];

export function FormatSelector() {
  const format = useAudioConfig((s) => s.format);
  const setFormat = useAudioConfig((s) => s.setFormat);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-2xs font-medium text-text-tertiary">Format:</span>
      <div className="flex gap-px rounded-md border border-border bg-surface-secondary p-0.5">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFormat(f.value)}
            title={f.desc}
            className={`rounded px-2 py-0.5 text-2xs font-medium transition-colors ${
              format === f.value
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
