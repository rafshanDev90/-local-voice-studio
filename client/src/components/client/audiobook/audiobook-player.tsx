"use client";

import { useEffect, useRef, useState } from "react";
import type { Chapter } from "~/lib/audiobook";

export function AudiobookPlayer({
  audioUrl,
  chapters,
  chapterIndex,
  onChapterChange,
  onExport,
}: {
  audioUrl: string;
  chapters: Chapter[];
  chapterIndex: number;
  onChapterChange: (i: number) => void;
  onExport: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const safeChapters = chapters.length > 0 ? chapters : [{ title: "Full Book", start_ms: 0, end_ms: 0 }];
  const current = safeChapters[chapterIndex] ?? safeChapters[0];
  const isSimple = chapters.length === 0 || (chapters.length === 1 && chapters[0]?.title === "Full Book");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime * 1000);
    const onLoaded = () => setDuration(audio.duration * 1000);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const seekTo = (ms: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = ms / 1000;
    setCurrentTime(ms);
  };

  const jumpToChapter = (i: number) => {
    const ch = chapters[i];
    if (!ch) return;
    onChapterChange(i);
    seekTo(ch.start_ms);
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const last = safeChapters[safeChapters.length - 1];
  const first = safeChapters[0];
  const totalDur = safeChapters.length > 0 && last && first
    ? last.end_ms - first.start_ms
    : duration;
  const progress = totalDur > 0 ? (currentTime / totalDur) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {!isSimple && (
        <div className="border-b border-border px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Chapters
          </p>
          <div className="flex flex-wrap gap-2">
            {chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => jumpToChapter(i)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  i === chapterIndex
                    ? "bg-brand-maroon text-white"
                    : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                }`}
              >
                {ch.title.length > 28
                  ? ch.title.slice(0, 28) + "…"
                  : ch.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player controls */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-4">
          {!isSimple && (
            <button
              onClick={() => jumpToChapter(Math.max(0, chapterIndex - 1))}
              disabled={chapterIndex === 0}
              className="disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-text-secondary">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            </button>
          )}

          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-maroon text-white transition hover:bg-brand-maroon/90"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {!isSimple && (
            <button
              onClick={() => jumpToChapter(Math.min(chapters.length - 1, chapterIndex + 1))}
              disabled={chapterIndex >= chapters.length - 1}
              className="disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-text-secondary">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          )}

          {/* Progress bar */}
          <div className="flex flex-1 items-center gap-3">
            <span className="w-10 text-right text-xs text-text-tertiary tabular-nums">
              {formatTime(currentTime - (current?.start_ms ?? 0))}
            </span>
            <div
              className="h-1.5 flex-1 cursor-pointer rounded-full bg-gray-200"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seekTo(pct * totalDur);
              }}
            >
              <div
                className="h-full rounded-full bg-brand-maroon transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-10 text-xs text-text-tertiary tabular-nums">
              {formatTime(totalDur)}
            </span>
          </div>

          <button
            onClick={onExport}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-50"
          >
            Export
          </button>
        </div>

        {/* Current chapter */}
        {current && (
          <p className="mt-3 text-xs text-text-secondary">
            <span className="font-medium text-text-primary">{current.title}</span>
            {" · "}
            {formatTime(current.end_ms - current.start_ms)}
          </p>
        )}
      </div>
    </div>
  );
}
