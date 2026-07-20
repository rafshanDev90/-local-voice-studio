export interface VoiceCleanerOptions {
  file: File;
  outputFormat?: string;
  propDecrease?: number;
}

export interface VoiceCleanerResult {
  audioUrl: string;
  blob: Blob;
  originalName: string;
  outputFormat: string;
}

const MIME_MAP: Record<string, string> = {
  wav: "audio/wav",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  flac: "audio/flac",
};

export async function cleanVoice({
  file,
  outputFormat = "wav",
  propDecrease = 0.8,
}: VoiceCleanerOptions): Promise<VoiceCleanerResult> {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams({
    output_format: outputFormat,
    prop_decrease: String(propDecrease),
  });

  const res = await fetch(`/api/voice-cleaner?${params}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Voice cleaning failed (${res.status})`);
  }

  const data = await res.json();
  const audioEndpoint: string | null = data.audioUrl ?? null;

  if (!audioEndpoint) {
    throw new Error("Cleaning succeeded but no audio URL was returned");
  }

  const audioRes = await fetch(audioEndpoint);
  if (!audioRes.ok) {
    throw new Error(`Failed to fetch cleaned audio (${audioRes.status})`);
  }

  const arrayBuffer = await audioRes.arrayBuffer();
  const mimeType = MIME_MAP[outputFormat] ?? "audio/wav";
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);

  return {
    audioUrl: blobUrl,
    blob,
    originalName: data.originalName ?? file.name,
    outputFormat: data.outputFormat ?? outputFormat,
  };
}

export function revokeCleanerAudioUrl(url: string | null | undefined): void {
  if (typeof window === "undefined") return;
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
