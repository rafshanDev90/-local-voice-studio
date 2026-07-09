"use client";

import { useCallback, useRef, useState } from "react";
import { useVoiceStore, LANGUAGES } from "~/stores/voice-store";
import { useAudioConfig } from "~/stores/audio-config";
import { generateAudiobook, type Chapter } from "~/lib/audiobook";
import { AudiobookPlayer } from "~/components/client/audiobook/audiobook-player";
import { AudiobookCatalog } from "~/components/client/audiobook/audiobook-catalog";
import { IoLanguageOutline, IoBookOutline, IoLibraryOutline } from "react-icons/io5";

type Tab = "generate" | "library";

export function AudiobookEditor() {
  const [tab, setTab] = useState<Tab>("generate");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedVoice = useVoiceStore((s) => s.selectedVoices.styletts2);
  const selectedLanguage = useVoiceStore((s) => s.selectedLanguage);
  const setSelectedLanguage = useVoiceStore((s) => s.setSelectedLanguage);
  const getVoices = useVoiceStore((s) => s.getVoices);
  const availableVoices = getVoices("styletts2", selectedLanguage);
  const { speed } = useAudioConfig();

  const handleGenerate = useCallback(async () => {
    if (!text.trim() || !selectedVoice) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setChapters([]);
    setChapterIndex(0);

    try {
      const result = await generateAudiobook(
        text,
        selectedVoice.id,
        speed,
        "mp3",
      );
      setAudioUrl(result.audioUrl);
      setChapters(result.chapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [text, selectedVoice, speed]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result;
        if (typeof content === "string") setText(content);
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleExport = useCallback(() => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "audiobook.mp3";
    a.click();
  }, [audioUrl]);

  const displayChapters =
    chapters.length > 0
      ? chapters
      : audioUrl
        ? [{ title: "Full Book", start_ms: 0, end_ms: 0 }]
        : [];

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-[#f7f7f4] shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setTab("generate")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition ${
            tab === "generate"
              ? "border-b-2 border-brand-maroon text-brand-maroon"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <IoBookOutline className="h-4 w-4" />
          Generate
        </button>
        <button
          onClick={() => setTab("library")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition ${
            tab === "library"
              ? "border-b-2 border-brand-maroon text-brand-maroon"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <IoLibraryOutline className="h-4 w-4" />
          My Library
        </button>
      </div>

      {tab === "generate" ? (
        <>
          {/* Header area */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:px-5">
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <IoLanguageOutline className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="max-w-[160px] bg-transparent text-sm font-medium text-gray-900 outline-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-xs text-gray-500">
              {selectedVoice && (
                <span className="truncate rounded-full border border-gray-200 bg-white px-3 py-1.5">
                  {selectedVoice.name}
                </span>
              )}
              {selectedVoice && (
                <span className="whitespace-nowrap rounded-full bg-gray-900 px-3 py-1.5 text-white">
                  {availableVoices.length} voice{availableVoices.length !== 1 ? "s" : ""} available
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Upload .txt
              </button>
            </div>
          </div>

          {/* Text input */}
          <div className="relative min-h-[160px] flex-1 px-3 py-3 md:px-5 md:py-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your book, article, or any long-form text here... Supports Markdown headings (# Chapter 1) and Bangla chapter patterns (অধ্যায়, পরিচ্ছেদ) for chapter detection."
              disabled={loading}
              className="h-full min-h-[200px] w-full resize-y rounded-xl border border-gray-200 bg-white p-4 text-base leading-6 text-gray-950 shadow-sm outline-none transition placeholder:font-light placeholder:text-gray-400 focus:border-gray-300 focus:ring-4 focus:ring-gray-900/5 disabled:cursor-wait disabled:bg-gray-50 md:p-5"
            />
          </div>

          {/* Loading skeleton */}
          {loading && !audioUrl && (
            <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:mx-5 md:mb-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-9 flex-1 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                  <div className="hidden h-9 w-24 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer md:block" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-20 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-20 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Generated audio player */}
          {audioUrl && (
            <div className="mx-3 mb-3 animate-fade-in md:mx-5 md:mb-5">
              <AudiobookPlayer
                audioUrl={audioUrl}
                chapters={displayChapters}
                chapterIndex={chapterIndex}
                onChapterChange={setChapterIndex}
                onExport={handleExport}
              />
            </div>
          )}

          {error && (
            <div className="mx-3 mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:mx-5 md:mb-5">
              {error}
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 md:px-5">
            <span className="text-xs text-text-tertiary">
              <span className="tabular-nums">{text.length.toLocaleString()}</span>
              <span className="ml-1">characters</span>
            </span>
            <button
              onClick={handleGenerate}
              disabled={loading || !text.trim() || !selectedVoice}
              className="relative h-9 overflow-hidden rounded-lg bg-text-primary px-5 text-sm font-medium text-white transition-all duration-150 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-1 w-1 animate-pulse-dot rounded-full bg-white/70" style={{ animationDelay: "0ms" }} />
                  <span className="h-1 w-1 animate-pulse-dot rounded-full bg-white/70" style={{ animationDelay: "200ms" }} />
                  <span className="h-1 w-1 animate-pulse-dot rounded-full bg-white/70" style={{ animationDelay: "400ms" }} />
                </span>
              ) : (
                "Generate Audiobook"
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
          <AudiobookCatalog />
        </div>
      )}
    </div>
  );
}
