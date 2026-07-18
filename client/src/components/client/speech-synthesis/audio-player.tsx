"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IoMicOutline, IoPause, IoPlay } from "react-icons/io5";
import { GoDownload } from "react-icons/go";

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  audioUrl,
  title,
  onDownload,
}: {
  audioUrl: string;
  title?: string;
  onDownload?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onCanPlay = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", onCanPlay);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (!audio || !bar || !duration) return;

      const rect = bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.min(1, Math.max(0, x / rect.width));
      audio.currentTime = percent * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mx-3 mb-3 animate-fade-in flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:mx-5 md:mb-5 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white">
          <IoMicOutline className="h-4 w-4" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/* Title */}
          {title && (
            <p className="truncate text-xs font-medium text-gray-500">{title}</p>
          )}

          {/* Player row */}
          <div className="flex items-center gap-2.5">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-950 text-white transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <IoPause className="h-3.5 w-3.5" />
              ) : (
                <IoPlay className="ml-0.5 h-3.5 w-3.5" />
              )}
            </button>

            {/* Progress bar */}
            <div
              ref={progressRef}
              onClick={handleSeek}
              className="group relative flex-1 cursor-pointer"
            >
              <div className="h-1 w-full rounded-full bg-gray-200 transition-all group-hover:h-1.5">
                <div
                  className="h-full rounded-full bg-gray-900 transition-[width] duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Time */}
            <span className="flex-shrink-0 text-[11px] tabular-nums text-gray-400">
              {formatTime(currentTime)}
              <span className="mx-0.5">/</span>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Download */}
      {onDownload && (
        <button
          onClick={onDownload}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 md:w-10 md:px-0"
          title="Download"
        >
          <GoDownload className="h-4 w-4" />
          <span className="md:hidden">Download</span>
        </button>
      )}
    </div>
  );
}
