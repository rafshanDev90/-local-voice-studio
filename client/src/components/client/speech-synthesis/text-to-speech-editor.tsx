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
import { GoDownload } from "react-icons/go";
import { ServiceType } from "~/types/services";
import { GenerateButton } from "../generate-button";
import { generateSpeech, LanguageMismatchError } from "~/lib/tts";
import { useVoiceStore, LANGUAGES } from "~/stores/voice-store";
import { useAudioStore } from "~/stores/audio-store";
import toast from "react-hot-toast";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedLanguage = useVoiceStore((s) => s.selectedLanguage);
  const setSelectedLanguage = useVoiceStore((s) => s.setSelectedLanguage);
  const selectedVoice = useVoiceStore((s) => s.selectedVoices[service]);
  const getVoices = useVoiceStore((s) => s.getVoices);

  const { playAudio } = useAudioStore();

  const availableVoices = getVoices(service, selectedLanguage);

  const blobUrlRef = useRef<string | null>(null);

  // Hide inline player when text changes (don't revoke blob URL —
  // Playbar may still reference it via zustand store)
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
    a.download = `voice-${Date.now()}.wav`;
    a.click();
  }, [audioBlob, audioUrl]);

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
    setAudioBlob(null);
    setAudioUrl(null);

    try {
      const result = await generateSpeech({
        text: textContent,
        voice: selectedVoice.id,
        languageCode: selectedLanguage === "auto" ? null : selectedLanguage,
        service,
      });

      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = result.audioUrl;

      setAudioUrl(result.audioUrl);
      setAudioBlob(result.blob);

      if (result.languageDetected) {
        const lang = LANGUAGES.find((l) => l.code === result.languageDetected);
        if (lang) toast.success(`Language: ${lang.label}`);
      }

      playAudio({
        id: Date.now().toString(),
        title:
          textContent.substring(0, 50) +
          (textContent.length > 50 ? "..." : ""),
        audioUrl: result.audioUrl,
        voice: selectedVoice.name,
        duration: "0:30",
        progress: 0,
        service,
        createdAt: new Date().toLocaleDateString(),
      });
    } catch (err) {
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

      <div className="relative min-h-[320px] flex-1 px-3 py-3 md:px-5 md:py-5">
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder={activePlaceholder}
          disabled={loading}
          className="h-full min-h-[320px] w-full resize-none rounded-xl border border-gray-200 bg-white p-5 text-base leading-7 text-gray-950 shadow-sm outline-none transition placeholder:font-light placeholder:text-gray-400 focus:border-gray-300 focus:ring-4 focus:ring-gray-900/5 disabled:cursor-wait disabled:bg-gray-50 md:p-6"
        />
      </div>

      {/* Generated audio player */}
      {audioUrl && (
        <div className="mx-3 mb-3 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:mx-5 md:mb-5 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white">
              <IoMicOutline className="h-4 w-4" />
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="h-9 min-w-0 flex-1"
            />
          </div>
          <button
            onClick={handleDownload}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 md:w-10 md:px-0"
            title="Download WAV"
          >
            <GoDownload className="h-4 w-4" />
            <span className="md:hidden">Download</span>
          </button>
        </div>
      )}

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
              textContent.length > 5000 ||
              textContent.trim().length === 0 ||
              loading
            }
            isLoading={loading}
            showDownload={false}
            creditsRemaining={credits}
            showCredits={true}
            characterCount={textContent.length}
            characterLimit={5000}
          />
        )}
      </div>
    </div>
  );
}
