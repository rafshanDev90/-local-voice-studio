"use client";

import { IoMicOutline } from "react-icons/io5";

export function GeneratingLoader() {
  return (
    <div className="mx-3 mb-3 animate-fade-in overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:mx-5 md:mb-5">
      <div className="flex items-center gap-4">
        {/* Mic icon */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
          <IoMicOutline className="h-5 w-5" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          {/* Text */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              Generating your voice
            </span>
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-gray-400" style={{ animationDelay: "200ms" }} />
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-gray-400" style={{ animationDelay: "400ms" }} />
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="generating-progress-bar h-full rounded-full bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900" />
          </div>

          {/* Waveform bars */}
          <div className="flex items-end gap-[3px]" style={{ height: "14px" }}>
            {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
              <div
                key={i}
                className="w-[3px] origin-bottom rounded-full bg-gray-900/60 animate-waveform"
                style={{
                  height: "100%",
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
