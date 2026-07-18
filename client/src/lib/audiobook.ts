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

export async function generateAudiobook(
  text: string,
  voice: string,
  speed: number,
  format: string = "mp3",
): Promise<AudiobookResult> {
  const params = new URLSearchParams({ voice, speed: String(speed), format });
  const res = await fetch(`/api/audiobook?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Generation failed (${res.status})`);
  }

  const data = await res.json();
  const chapters: Chapter[] = data.chapters ?? [];
  const historyId: string | undefined = data.historyId ?? undefined;
  const audioEndpoint: string | null = data.audioUrl ?? null;

  if (!audioEndpoint) {
    throw new Error("Audiobook generation succeeded but no audio URL was returned");
  }

  const audioRes = await fetch(audioEndpoint);
  if (!audioRes.ok) {
    throw new Error(`Failed to fetch audiobook audio (${audioRes.status})`);
  }
  const blob = await audioRes.blob();
  const audioUrl = URL.createObjectURL(blob);

  return { audioUrl, blob, chapters, historyId };
}

export async function deleteAudiobook(id: string): Promise<boolean> {
  const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function uploadCover(
  id: string,
  file: File,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`/api/audiobook/${id}/cover`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Cover upload failed");
  const data = await res.json();
  return data.coverUrl as string;
}

export function getCoverUrl(id: string): string {
  return `/api/audiobook/${id}/cover`;
}
