"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchHistory, type HistoryItem } from "~/lib/history";
import { AudiobookCard } from "./audiobook-card";
import { IoBookOutline } from "react-icons/io5";

export function AudiobookCatalog() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchHistory(undefined, 100);
      setItems(res.items);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (activeId === id) setActiveId(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="aspect-[3/4] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-full rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-3 w-2/3 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <IoBookOutline className="mb-3 h-12 w-12" />
        <p className="text-sm font-medium">No saved audiobooks yet</p>
        <p className="mt-1 text-xs">
          Generate your first audiobook to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <AudiobookCard
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onPlay={(it) => setActiveId(it.id)}
          onPause={() => setActiveId(null)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
