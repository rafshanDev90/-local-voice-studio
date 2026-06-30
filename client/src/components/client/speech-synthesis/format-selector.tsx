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
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Format:</span>
      <div className="flex gap-1">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFormat(f.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              format === f.value
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={f.desc}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
