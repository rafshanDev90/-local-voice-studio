"use client";

import { useEffect, useState } from "react";
import { IoDownloadOutline, IoPlay, IoPause, IoTrashOutline } from "react-icons/io5";
import { HistoryItem as HistoryItemType, fetchHistory, getAudioUrl, deleteHistoryItem } from "~/lib/history";
import { useAudioStore } from "~/stores/audio-store";
import { useVoiceStore, Voice } from "~/stores/voice-store";
import { ServiceType } from "~/types/services";

export function HistoryPanel({
  service,
  searchQuery,
  setSearchQuery,
  hoveredItem,
  setHoveredItem,
}: {
  service: ServiceType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
}) {
  const { playAudio, currentAudio, isPlaying, togglePlayPause } = useAudioStore();
  const getVoices = useVoiceStore((state) => state.getVoices);
  const voices = getVoices(service);
  const [items, setItems] = useState<HistoryItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchHistory(service)
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [service]);

  const handlePlayHistoryItem = (item: HistoryItemType) => {
    const url = item.id ? getAudioUrl(item.id) : item.audioUrl;
    if (url) {
      playAudio({
        id: item.id,
        title: item.title,
        voice: item.voice,
        audioUrl: url,
        service: item.service,
      });
    }
  };

  const handleDownload = (item: HistoryItemType) => {
    const url = item.id ? getAudioUrl(item.id) : item.audioUrl;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title || "voice"}.wav`;
    a.click();
  };

  const handleDelete = async (item: HistoryItemType) => {
    if (!item.id) return;
    const success = await deleteHistoryItem(item.id);
    if (success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const isItemPlaying = (item: HistoryItemType) => {
    return currentAudio?.id === item.id && isPlaying;
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="w-full flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="mt-2 flex h-[100vh] w-full flex-col overflow-y-auto">
          {(() => {
            const filteredGroups = Object.entries(
              items
                .filter(
                  (item) =>
                    item.title
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    item.voiceName
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )
                .reduce((groups: Record<string, typeof items>, item) => {
                  const date = item.date;
                  if (!groups[date]) {
                    groups[date] = [];
                  }
                  groups[date].push(item);
                  return groups;
                }, {}),
            );
            return filteredGroups.length > 0 ? (
              filteredGroups.map(([date, groupItems]) => (
                <div key={date}>
                  <div className="sticky top-0 z-10 my-2 flex w-full justify-center bg-white py-1">
                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                      {date}
                    </div>
                  </div>
                  {groupItems.map((item) => (
                    <HistoryItemComponent
                      key={item.id}
                      item={item}
                      voices={voices}
                      hoveredItem={hoveredItem}
                      setHoveredItem={setHoveredItem}
                      onPlay={handlePlayHistoryItem}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      isPlaying={isItemPlaying(item)}
                      onTogglePlayPause={togglePlayPause}
                    />
                  ))}
                </div>
              ))
            ) : (
              <p className="mt-8 text-center text-sm text-gray-500">
                No results found
              </p>
            );
          })()}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="mt-3 text-sm text-gray-500">No history items yet</p>
        </div>
      )}
    </div>
  );
}

function HistoryItemComponent({
  item,
  voices,
  hoveredItem,
  setHoveredItem,
  onPlay,
  onDownload,
  onDelete,
  isPlaying,
  onTogglePlayPause,
}: {
  item: HistoryItemType;
  voices: Voice[];
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  onPlay: (item: HistoryItemType) => void;
  onDownload: (item: HistoryItemType) => void;
  onDelete: (item: HistoryItemType) => void;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
}) {
  const voiceUsed =
    voices.find((voice) => voice.id === item.voice) || voices[0];

  const handlePlayPause = () => {
    if (isPlaying) {
      onTogglePlayPause();
    } else {
      onPlay(item);
    }
  };

  return (
    <div
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className="relative flex items-center rounded-lg p-4 hover:bg-gray-100"
    >
      <div className="flex w-full flex-col gap-1">
        <div className="relative w-full">
          <p className="truncate text-sm">{item.title || "No title"}</p>
          {hoveredItem === item.id && (
            <div className="absolute right-0 top-0 flex items-center gap-1 bg-gray-100 pl-2">
              <button
                onClick={handlePlayPause}
                className="rounded-full p-1 hover:bg-gray-200"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <IoPause className="h-5 w-5" />
                ) : (
                  <IoPlay className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => onDownload(item)}
                className="rounded-full p-1 hover:bg-gray-200"
                title="Download"
              >
                <IoDownloadOutline className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="rounded-full p-1 text-red-500 hover:bg-red-100"
                title="Delete"
              >
                <IoTrashOutline className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {voiceUsed && (
            <>
              <div
                className="flex h-3 w-3 items-center justify-center rounded-full text-xs text-white"
                style={{ background: voiceUsed.gradientColors }}
              />
              <span className="text-xs font-light text-gray-500">
                {voiceUsed.name}
              </span>
              <span className="text-xs font-light text-gray-500">·</span>
            </>
          )}
          <span className="text-xs font-light text-gray-500">
            {item.time || "now"}
          </span>
        </div>
      </div>
    </div>
  );
}
