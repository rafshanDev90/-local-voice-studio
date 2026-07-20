"use client";

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaUpload, FaCheckCircle } from "react-icons/fa";
import { GenerateButton } from "~/components/client/generate-button";
import { AudioPlayer } from "~/components/client/speech-synthesis/audio-player";
import { GeneratingLoader } from "~/components/client/speech-synthesis/generating-loader";
import { cleanVoice, revokeCleanerAudioUrl } from "~/lib/voice-cleaner";

const ALLOWED_AUDIO_TYPES = [
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/flac",
  "audio/x-m4a",
  "audio/mp4",
  "audio/x-wav",
  "audio/webm",
];
const MAX_FILE_SIZE_MB = 100;

const FORMAT_OPTIONS = [
  { value: "wav", label: "WAV" },
  { value: "mp3", label: "MP3" },
  { value: "ogg", label: "OGG" },
  { value: "flac", label: "FLAC" },
] as const;

export function VoiceCleaner({ credits }: { credits: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cleanedAudioUrl, setCleanedAudioUrl] = useState<string | null>(null);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [outputFormat, setOutputFormat] = useState("wav");
  const audioUrlRef = useRef<string | null>(null);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      const isAllowed = ALLOWED_AUDIO_TYPES.includes(selectedFile.type) ||
        /\.(wav|mp3|ogg|flac|m4a|wma|aac)$/i.test(selectedFile.name);
      const isUnderLimit = selectedFile.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

      if (isAllowed && isUnderLimit) {
        if (audioUrlRef.current) {
          revokeCleanerAudioUrl(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        setFile(selectedFile);
        setCleanedAudioUrl(null);
        setCleanedBlob(null);
      } else {
        toast.error(
          isAllowed
            ? `File too large. Max size is ${MAX_FILE_SIZE_MB}MB`
            : "Unsupported format. Use WAV, MP3, OGG, FLAC, or M4A",
        );
      }
    },
    [],
  );

  const handleClean = useCallback(async () => {
    if (!file) return;

    try {
      setIsLoading(true);
      setCleanedAudioUrl(null);
      setCleanedBlob(null);

      const result = await cleanVoice({
        file,
        outputFormat,
      });

      audioUrlRef.current = result.audioUrl;
      setCleanedAudioUrl(result.audioUrl);
      setCleanedBlob(result.blob);
      toast.success("Voice cleaned successfully");
    } catch (error) {
      console.error("Voice cleaning failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Voice cleaning failed",
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, outputFormat]);

  const handleDownload = useCallback(() => {
    if (!cleanedBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(cleanedBlob);
    const baseName = file?.name.replace(/\.[^.]+$/, "") ?? "cleaned";
    a.download = `${baseName}-cleaned.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, [cleanedBlob, file, outputFormat]);

  const handleReset = useCallback(() => {
    if (audioUrlRef.current) {
      revokeCleanerAudioUrl(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setFile(null);
    setCleanedAudioUrl(null);
    setCleanedBlob(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-1 flex-col justify-between px-4">
      <div className="flex flex-1 flex-col gap-4 py-8">
        {/* Upload zone */}
        <div
          className={`w-full max-w-xl mx-auto rounded-2xl border-2 border-dotted p-8 transition-all duration-200 ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300"
          } ${file ? "bg-white" : "bg-gray-50"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => {
            if (isLoading) return;
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".wav,.mp3,.ogg,.flac,.m4a,.wma,.aac";
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files?.[0]) {
                handleFileSelect(target.files[0]);
              }
            };
            input.click();
          }}
        >
          {file ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
                <FaUpload className="h-4 w-4 text-blue-400" />
              </div>
              <p className="mb-1 text-sm font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLoading) handleReset();
                }}
                disabled={isLoading}
                className={`mt-2 text-sm ${
                  isLoading
                    ? "cursor-not-allowed text-gray-400"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                Choose a different file
              </button>
            </div>
          ) : (
            <div className="flex cursor-pointer flex-col items-center py-8 text-center">
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
                <FaUpload className="h-4 w-4 text-gray-500" />
              </div>
              <p className="mb-1 text-sm font-medium">
                Click to upload, or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                WAV, MP3, OGG, FLAC, M4A — up to 100MB
              </p>
            </div>
          )}
        </div>

        {/* Format selector */}
        <div className="mx-auto flex w-full max-w-xl gap-2">
          <span className="text-sm text-gray-500">Output:</span>
          {FORMAT_OPTIONS.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => setOutputFormat(fmt.value)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                outputFormat === fmt.value
                  ? "bg-gray-950 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && <GeneratingLoader />}

        {/* Result player */}
        {cleanedAudioUrl && !isLoading && (
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-2 flex items-center gap-2 px-1">
              <FaCheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                Cleaned successfully
              </span>
            </div>
            <AudioPlayer
              audioUrl={cleanedAudioUrl}
              title={file?.name ? `Cleaned — ${file.name}` : "Cleaned audio"}
              onDownload={handleDownload}
            />
          </div>
        )}
      </div>

      {/* Action button */}
      <GenerateButton
        onGenerate={handleClean}
        isDisabled={!file || isLoading}
        isLoading={isLoading}
        showDownload={!!cleanedAudioUrl}
        creditsRemaining={credits}
        buttonText={cleanedAudioUrl ? "Clean Again" : "Clean Voice"}
      />
    </div>
  );
}
