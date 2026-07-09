export interface Chapter {
  title: string;
  start_ms: number;
  end_ms: number;
}

export interface AudiobookResult {
  audioUrl: string;
  blob: Blob;
  chapters: Chapter[];
  historyId?: string;
}

const BACKEND = "http://127.0.0.1:8000";

export async function generateAudiobook(
  text: string,
  voice: string,
  speed: number,
  format: string = "mp3",
): Promise<AudiobookResult> {
  const params = new URLSearchParams({ voice, speed: String(speed), format });
  const res = await fetch(`${BACKEND}/api/audiobook?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Generation failed (${res.status})`);
  }

  const chaptersHeader = res.headers.get("X-Chapters");
  const chapters: Chapter[] = chaptersHeader ? JSON.parse(chaptersHeader) : [];
  const historyId = res.headers.get("X-History-Id") ?? undefined;

  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);

  return { audioUrl, blob, chapters, historyId };
}

export async function deleteAudiobook(id: string): Promise<boolean> {
  const res = await fetch(`${BACKEND}/api/history/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function uploadCover(
  id: string,
  file: File,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BACKEND}/api/audiobook/${id}/cover`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Cover upload failed");
  const data = await res.json();
  return data.coverUrl as string;
}

export function getCoverUrl(id: string): string {
  return `${BACKEND}/api/audiobook/${id}/cover`;
}
