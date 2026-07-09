"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HistoryItem } from "~/lib/history";
import { deleteAudiobook, uploadCover, getCoverUrl } from "~/lib/audiobook";
import { useVoiceStore } from "~/stores/voice-store";
import {
  IoTrashOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoImageOutline,
} from "react-icons/io5";

const LANG_LABELS: Record<string, string> = {
  "en-us": "English",
  "en-gb": "English (UK)",
  "en-au": "English (AU)",
  "bn-bd": "বাংলা",
  "bn-in": "বাংলা",
};

export function AudiobookCard({
  item,
  isActive,
  onPlay,
  onPause,
  onDelete,
}: {
  item: HistoryItem;
  isActive: boolean;
  onPlay: (item: HistoryItem) => void;
  onPause: () => void;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [coverSrc, setCoverSrc] = useState<string | null>(
    item.coverImage ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const voices = useVoiceStore((s) => s.voices);
  const voice = voices.find((v) => v.id === item.voice);
  const gradient =
    voice?.gradientColors ?? "linear-gradient(45deg, #8b5cf6, #ec4899)";

  const chapterCount =
    typeof item.chapters === "string"
      ? JSON.parse(item.chapters).length
      : Array.isArray(item.chapters)
        ? item.chapters.length
        : 0;

  const langLabel = LANG_LABELS[item.language] ?? item.language;
  const isBangla = item.language.startsWith("bn");

  const handleDelete = async () => {
    if (!confirm("Delete this audiobook?")) return;
    setDeleting(true);
    const ok = await deleteAudiobook(item.id);
    if (ok) onDelete(item.id);
    else setDeleting(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCover(item.id, file);
      setCoverSrc(url);
    } catch {
      /* ignore */
    }
    setUploading(false);
  };

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;

    if (audio && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause();
      return;
    }

    if (audio && !isPlaying && audio.src) {
      audio.play();
      setIsPlaying(true);
      onPlay(item);
      return;
    }

    // First time — fetch and play
    onPlay(item);
    try {
      const res = await fetch(item.audioUrl);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const newAudio = new Audio(url);
      audioRef.current = newAudio;

      newAudio.addEventListener("timeupdate", () => {
        if (newAudio.duration) {
          setProgress((newAudio.currentTime / newAudio.duration) * 100);
        }
      });
      newAudio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });

      await newAudio.play();
      setIsPlaying(true);
    } catch {
      /* ignore */
    }
  }, [isPlaying, item, onPlay, onPause]);

  // When another card plays, stop this one
  useEffect(() => {
    if (!isActive && audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Cover image / gradient */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden"
        style={coverSrc ? undefined : { background: gradient }}
      >
        {coverSrc && (
          <img
            src={getCoverUrl(item.id)}
            alt={item.title}
            className="h-full w-full object-cover"
            onError={() => setCoverSrc(null)}
          />
        )}

        {/* Cover upload overlay */}
        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors hover:bg-black/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/0 text-white/0 transition-all group-hover:bg-white/90 group-hover:text-gray-900">
            <IoImageOutline className="h-5 w-5" />
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={uploading}
          />
        </label>

        {/* Language badge */}
        <span
          className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            isBangla
              ? "bg-emerald-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {langLabel}
        </span>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
        >
          <IoTrashOutline className="h-3.5 w-3.5" />
        </button>

        {/* Progress bar at bottom of cover */}
        {(isPlaying || progress > 0) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-brand-maroon transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 leading-snug">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500">{item.voiceName}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[11px] text-gray-400">
            {chapterCount > 0
              ? `${chapterCount} chapter${chapterCount > 1 ? "s" : ""}`
              : item.duration}
          </span>
          <button
            onClick={handlePlayPause}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-maroon text-white transition hover:bg-brand-maroon/90"
          >
            {isPlaying ? (
              <IoPauseOutline className="h-4 w-4" />
            ) : (
              <IoPlayOutline className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
