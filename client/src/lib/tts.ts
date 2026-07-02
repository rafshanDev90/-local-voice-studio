export interface VoiceInfo {
  id: string;
  name: string;
  language: string;
  gender: string;
}

export interface GenerateOptions {
  text: string;
  voice?: string;
  speed?: number;
  stability?: number;
  styleExaggeration?: number;
  format?: string;
  languageCode?: string | null;
  userId?: string | null;
  service?: string;
}

export interface GenerateResult {
  audioUrl: string;
  blob: Blob;
  languageDetected: string | null;
  historyId: string | null;
}

export async function fetchVoices(language?: string): Promise<VoiceInfo[]> {
  const params = language ? `?language=${language}` : "";
  const res = await fetch(`/api/voices${params}`);
  if (!res.ok) throw new Error("Failed to fetch voices");
  return res.json();
}

export class LanguageMismatchError extends Error {
  constructor(
    message: string,
    public readonly requestedLanguage: string | null,
  ) {
    super(message);
    this.name = "LanguageMismatchError";
  }
}

const MIME_MAP: Record<string, string> = {
  wav: "audio/wav",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  flac: "audio/flac",
};

export async function generateSpeech({
  text,
  voice = "af_bella",
  speed = 1.0,
  stability = 0.5,
  styleExaggeration = 0.0,
  format = "wav",
  languageCode = null,
  userId = null,
  service = "styletts2",
}: GenerateOptions): Promise<GenerateResult> {
  const params = new URLSearchParams({
    voice,
    speed: String(speed),
    stability: String(stability),
    style_exaggeration: String(styleExaggeration),
    format,
    service,
  });
  if (languageCode) params.set("language_code", languageCode);
  if (userId) params.set("user_id", userId);

  const res = await fetch(`/api/generate?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (res.status === 422) {
    const err = await res.json().catch(() => ({ detail: "Unprocessable" }));
    throw new LanguageMismatchError(
      err.detail ?? "Language not supported by selected voice",
      languageCode,
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Generation failed (${res.status})`);
  }

  const languageDetected = res.headers.get("X-Language-Detected");
  const historyId = res.headers.get("X-History-Id") || null;
  const arrayBuffer = await res.arrayBuffer();
  const mimeType = MIME_MAP[format] ?? "audio/wav";
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const audioUrl = URL.createObjectURL(blob);

  return { audioUrl, blob, languageDetected, historyId };
}

export function revokeAudioUrl(audioUrl: string | null | undefined): void {
  if (typeof window === "undefined") return;
  if (audioUrl && audioUrl.startsWith("blob:")) {
    URL.revokeObjectURL(audioUrl);
  }
}
