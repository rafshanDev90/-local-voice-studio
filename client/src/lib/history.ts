import type { Chapter } from "~/lib/audiobook";

export interface HistoryItem {
  id: string;
  text: string | null;
  title: string;
  voice: string;
  voiceName: string;
  audioUrl: string;
  audioPath: string;
  service: string;
  language: string;
  duration: string;
  createdAt: string;
  date: string;
  time: string;
  coverImage?: string | null;
  chapters?: string | Chapter[];
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
}

export async function fetchHistory(
  service?: string,
  limit = 50,
  skip = 0,
): Promise<HistoryResponse> {
  const params = new URLSearchParams();
  if (service) params.set("service", service);
  params.set("limit", String(limit));
  params.set("skip", String(skip));
  const res = await fetch(`/api/history?${params}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function deleteHistoryItem(id: string): Promise<boolean> {
  const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
  return res.ok;
}

export function getAudioUrl(historyId: string): string {
  return `/api/audio/${historyId}`;
}
