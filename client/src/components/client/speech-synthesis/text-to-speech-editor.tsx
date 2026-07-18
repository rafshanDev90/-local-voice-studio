"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IoBookOutline,
  IoHappyOutline,
  IoMegaphoneOutline,
  IoLanguageOutline,
  IoFilmOutline,
  IoGameControllerOutline,
  IoMicOutline,
  IoLeafOutline,
} from "react-icons/io5";
import { ServiceType } from "~/types/services";
import { GenerateButton } from "../generate-button";
import { generateSpeech, LanguageMismatchError, revokeAudioUrl } from "~/lib/tts";
import { useVoiceStore, LANGUAGES } from "~/stores/voice-store";
import { useAudioConfig } from "~/stores/audio-config";
import { FormatSelector } from "~/components/client/speech-synthesis/format-selector";
import { GeneratingLoader } from "~/components/client/speech-synthesis/generating-loader";
import { AudioPlayer } from "~/components/client/speech-synthesis/audio-player";
import toast from "react-hot-toast";

const MAX_CHARS = 5000;

export function TextToSpeechEditor({
  service,
  credits,
}: {
  service: ServiceType;
  credits: number;
}) {
  const [textContent, setTextContent] = useState("");
  const [activePlaceholder, setActivePlaceholder] = useState(
    "Start typing here or paste any text you want to turn into lifelike speech...",
  );
  const [loading, setLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const selectedLanguage = useVoiceStore((s) => s.selectedLanguage);
  const setSelectedLanguage = useVoiceStore((s) => s.setSelectedLanguage);
  const selectedVoice = useVoiceStore((s) => s.selectedVoices[service]);
  const getVoices = useVoiceStore((s) => s.getVoices);

  const { speed, stability, styleExaggeration, format } = useAudioConfig();

  const availableVoices = getVoices(service, selectedLanguage);

  const blobUrlRef = useRef<string | null>(null);

  // Hide inline player when text changes
  useEffect(() => {
    setAudioBlob(null);
    setAudioUrl(null);
  }, [textContent]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleDownload = useCallback(() => {
    if (!audioBlob || !audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `voice-${Date.now()}.${format}`;
    a.click();
  }, [audioBlob, audioUrl, format]);

  const templateTexts = {
    "Narrate a story":
      "Once upon a time in a forest shrouded in mist, a young adventurer discovered an ancient doorway hidden beneath twisted roots. As they reached out to touch the weathered stone, the forest fell silent. What secrets would be revealed beyond this mysterious threshold?",
    "Tell a silly joke":
      "Why don't scientists trust atoms? Because they make up everything! Speaking of making things up, I once convinced my friend that the moon was just the back of the sun. He believed me until nighttime when both were visible in the sky.",
    "Record an advertisement":
      "Introducing TranquilSleep, the revolutionary mattress designed with cutting-edge comfort technology. Experience the perfect balance of support and softness that adapts to your body. Wake up refreshed and energized every morning! Order now and get 30% off your first purchase.",
    "Speak in different languages":
      "Hello! Hola! Bonjour! Ciao! Konnichiwa! Guten Tag! I can help you communicate your message in multiple languages. Perfect for reaching a global audience or adding an international flair to your content.",
    "Direct a dramatic movie scene":
      "The rain beats against the windows as Sarah stares at the faded photograph. 'I never thought it would end this way,' she whispers, her voice barely audible above the storm. Behind her, the door slowly opens. 'It doesn't have to,' says a familiar voice she never expected to hear again.",
    "Hear from a video game character":
      "Greetings, adventurer! I am Captain Varrick of the Starship Horizon. Our mission to explore the outer reaches of the Andromeda galaxy has led us to this mysterious planet. The energy readings are off the charts, and we need your help to investigate the ancient ruins ahead.",
    "Introduce your podcast":
      "Welcome to 'Unexplained Phenomena,' the podcast where we explore the mysteries that science has yet to solve. I'm your host, Alex Morgan, and today we're diving into the fascinating world of synchronicity - those meaningful coincidences that seem to defy the laws of probability.",
    "Guide a meditation class":
      "Settle into a comfortable position and gently close your eyes. Take a deep breath in through your nose, filling your lungs completely. Hold for a moment, and then exhale slowly through your mouth, releasing any tension you've been carrying. Feel your body becoming heavier with each breath, melting into the surface beneath you.",
  };

  const handleButtonHover = (text: string) => {
    setActivePlaceholder(templateTexts[text as keyof typeof templateTexts]);
  };

  const handleButtonClick = (text: string) => {
    setTextContent(templateTexts[text as keyof typeof templateTexts]);
  };

  const handleGenerate = async () => {
    if (!selectedVoice || !textContent.trim()) return;

    setLoading(true);
    revokeAudioUrl(blobUrlRef.current);
    blobUrlRef.current = null;
    setAudioBlob(null);
    setAudioUrl(null);

    try {
      const result = await generateSpeech({
        text: textContent,
        voice: selectedVoice.id,
        speed,
        stability,
        styleExaggeration,
        format,
        languageCode: selectedLanguage === "auto" ? null : selectedLanguage,
        service,
      });

      blobUrlRef.current = result.audioUrl;

      setAudioUrl(result.audioUrl);
      setAudioBlob(result.blob);

      if (result.languageDetected) {
        const lang = LANGUAGES.find((l) => l.code === result.languageDetected);
        if (lang) toast.success(`Language: ${lang.label}`);
      }
    } catch (err) {
      revokeAudioUrl(blobUrlRef.current);
      blobUrlRef.current = null;
      setAudioBlob(null);
      setAudioUrl(null);

      if (err instanceof LanguageMismatchError) {
        toast.error(
          `"${selectedVoice?.name}" doesn't support "${selectedLanguage}". Select a voice from the same language group.`,
        );
      } else {
        toast.error(
          err instanceof Error ? err.message : "Generation failed",
        );
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-[#f7f7f4] shadow-sm">
      {/* Language selector */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <IoLanguageOutline className="h-4 w-4 flex-shrink-0 text-gray-500" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="max-w-[180px] bg-transparent text-sm font-medium text-gray-900 outline-none"
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
        </div>
      </div>

      <div className="relative min-h-[160px] flex-1 px-3 py-3 md:px-5 md:py-4">
        <textarea
          value={textContent}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setTextContent(e.target.value);
            }
          }}
          placeholder={activePlaceholder}
          disabled={loading}
          maxLength={MAX_CHARS}
          className="h-full min-h-[160px] w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-base leading-6 text-gray-950 shadow-sm outline-none transition placeholder:font-light placeholder:text-gray-400 focus:border-gray-300 focus:ring-4 focus:ring-gray-900/5 disabled:cursor-wait disabled:bg-gray-50 md:p-5"
        />
        <div className="mt-1 flex justify-end">
          <span
            className={`text-xs ${
              textContent.length > MAX_CHARS * 0.9
                ? "text-red-500 font-medium"
                : textContent.length > MAX_CHARS * 0.7
                  ? "text-amber-500"
                  : "text-gray-400"
            }`}
          >
            {textContent.length} / {MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && !audioUrl && <GeneratingLoader />}

      {/* Generated audio player */}
      {audioUrl && (
        <AudioPlayer
          audioUrl={audioUrl}
          title={textContent.substring(0, 50) + (textContent.length > 50 ? "..." : "")}
          onDownload={handleDownload}
        />
      )}

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2 md:px-5">
        <FormatSelector />
      </div>
      <div className="border-t border-gray-200 bg-white px-4 py-4 md:px-5">
        {textContent.length === 0 ? (
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">Get started with</p>
              <p className="hidden text-xs text-gray-400 sm:block">
                Hover to preview, click to insert
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { text: "Narrate a story", icon: <IoBookOutline /> },
                { text: "Tell a silly joke", icon: <IoHappyOutline /> },
                { text: "Record an advertisement", icon: <IoMegaphoneOutline /> },
                { text: "Speak in different languages", icon: <IoLanguageOutline /> },
                { text: "Direct a dramatic movie scene", icon: <IoFilmOutline /> },
                { text: "Hear from a video game character", icon: <IoGameControllerOutline /> },
                { text: "Introduce your podcast", icon: <IoMicOutline /> },
                { text: "Guide a meditation class", icon: <IoLeafOutline /> },
              ].map(({ text, icon }) => (
                <button
                  key={text}
                  className="flex min-h-11 items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
                  onMouseEnter={() => handleButtonHover(text)}
                  onMouseLeave={() =>
                    setActivePlaceholder(
                      "Start typing here or paste any text you want to turn into lifelike speech...",
                    )
                  }
                  onClick={() => handleButtonClick(text)}
                >
                  <span className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                    {icon}
                  </span>
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <GenerateButton
            className="rounded-xl border border-gray-200 bg-gray-50 p-3"
            onGenerate={handleGenerate}
            isDisabled={
              textContent.length > MAX_CHARS ||
              textContent.trim().length === 0 ||
              loading
            }
            isLoading={loading}
            showDownload={false}
            creditsRemaining={credits}
            showCredits={true}
            characterCount={textContent.length}
            characterLimit={MAX_CHARS}
          />
        )}
      </div>
    </div>
  );
}
