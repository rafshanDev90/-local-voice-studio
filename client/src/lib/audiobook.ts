export interface Chapter {
  title: string;
  start_ms: number;
  end_ms: number;
}

export interface AudiobookResult {
  audioUrl: string;
  blob: Blob;
  chapters: Chapter[];
}

export async function generateAudiobook(
  text: string,
  voice: string,
  speed: number,
  format: string = "mp3",
): Promise<AudiobookResult> {
  const BACKEND = "http://127.0.0.1:8000";
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

  const mimeType = format === "mp3" ? "audio/mpeg" : "audio/wav";
  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);

  return { audioUrl, blob, chapters };
}
