"use client";

import { useCallback, useEffect } from "react";
import {
  IoChevronDown,
  IoDownloadOutline,
  IoPause,
  IoPlay,
  IoTimeOutline,
} from "react-icons/io5";
import { RiForward10Fill, RiReplay10Fill } from "react-icons/ri";
import { useAudioStore } from "~/stores/audio-store";
import { useVoiceStore } from "~/stores/voice-store";
import { audioManager } from "~/utils/audio-manager";

export default function Playbar() {
  const {
    currentAudio,
    isPlaybarOpen,
    isPlaying,
    progress,
    duration,
    togglePlaybar,
    togglePlayPause,
    skipForward,
    skipBackward,
    downloadAudio,
    setIsPlaying,
    setProgress,
    setDuration,
  } = useAudioStore();

  const getVoices = useVoiceStore((state) => state.getVoices);

  useEffect(() => {
    if (!currentAudio) return;

    const audio = audioManager.initialize();
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentProgress = audioManager.getProgress();
      setProgress(currentProgress);
    };

    const handleLoadedMetadata = () => {
      const durationTime = audioManager.getDuration();
      const formattedDuration = formatTime(durationTime);
      setDuration(formattedDuration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentAudio, setDuration, setIsPlaying, setProgress]);

  const styleTTS2Voices = getVoices("styletts2");
  const seedVCVoices = getVoices("seedvc");
  const allVoices = [...styleTTS2Voices, ...seedVCVoices];
  const voice = allVoices.find((v) => v.id === currentAudio?.voice);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentTimeFormatted = () => {
    return formatTime(audioManager.getCurrentTime());
  };

  const handleSeekStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
      audioManager.seek(percent);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = 5;
      let target = progress;

      if (e.key === "ArrowRight" || e.key === "Right") {
        target = Math.min(100, progress + step);
      } else if (e.key === "ArrowLeft" || e.key === "Left") {
        target = Math.max(0, progress - step);
      } else if (e.key === "Home") {
        target = 0;
      } else if (e.key === "End") {
        target = 100;
      } else {
        return;
      }

      audioManager.seek(target);
      e.preventDefault();
    },
    [audioManager, progress],
  );

  return (
    <>
      {!isPlaybarOpen && (
        <div
          onClick={(e) => {
            handleSeekStart(e);
            togglePlaybar();
          }}
          className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 transform cursor-pointer"
        >
          <div className="flex h-1 w-96 items-center rounded-full bg-gray-300">
            <div
              className="h-1 rounded-full bg-black"
              style={{ width: `${progress === 0 ? 100 : progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className={`relative border-t border-gray-200 bg-white shadow-md`}>
        <div className="absolute left-0 top-0 h-0.5 w-full bg-gray-200 md:hidden">
          <div
            className="absolute h-0.5 bg-black"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div
          className="transition-all duration-300 ease-in-out"
          style={{
            height: isPlaybarOpen ? "80px" : "0px",
          }}
        >
          <div className="hidden h-full md:grid md:grid-cols-[25%_50%_25%]">
            {/* Left section */}
            <div className="flex items-center px-4">
              <div className="flex flex-col gap-1">
                <p className="max-w-xs truncate text-sm">
                  {currentAudio?.title}
                </p>
                <div className="flex items-center text-xs text-gray-400">
                  {voice && (
                    <>
                      <div className="flex items-center">
                        <div
                          className="mr-1 flex h-3 w-3 items-center justify-center rounded-full text-white"
                          style={{ background: voice.gradientColors }}
                        />
                        <span>{voice.name}</span>
                        <span className="mx-1">·</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center">
                    <IoTimeOutline className="mr-1 h-3 w-3" />
                    <span>{currentAudio?.createdAt || "Just now"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center section */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center space-x-3">
                <button
                  onClick={skipBackward}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <RiReplay10Fill className="h-5 w-5" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
                >
                  {isPlaying ? (
                    <IoPause className="h-5 w-5" />
                  ) : (
                    <IoPlay className="ml-0.5 h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={skipForward}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <RiForward10Fill className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-1 flex w-full items-center">
                <div className="mr-2 flex items-center gap-1">
                  <div
                    className="flex origin-bottom items-end gap-[2px]"
                    style={{ height: "16px" }}
                  >
                    {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
                      <div
                        key={i}
                        className={`w-[3px] origin-bottom rounded-sm bg-black/70 transition-transform duration-300 ${
                          isPlaying ? "animate-waveform" : "scale-y-[0.2]"
                        }`}
                        style={{
                          height: "100%",
                          animationDelay: isPlaying ? `${delay}s` : "0s",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {getCurrentTimeFormatted()}
                  </span>
                </div>
                <div
                  role="slider"
                  aria-label="Audio progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  onClick={handleSeekStart}
                  className="relative flex-1 cursor-pointer"
                >
                  <div className="h-1 rounded-full bg-gray-200">
                    <div
                      className="absolute h-1 rounded-full bg-black"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="ml-2 text-xs text-gray-400">{duration}</span>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center justify-end gap-4 px-6">
              <button
                onClick={downloadAudio}
                className="rounded-full p-1.5 hover:bg-gray-100"
              >
                <IoDownloadOutline className="h-5 w-5" />
              </button>
              <button
                onClick={togglePlaybar}
                className="rounded-full p-1.5 hover:bg-gray-100"
              >
                <IoChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile view */}
          <div className="flex h-full md:hidden">
            <div className="flex flex-1 items-center px-4">
              <div className="flex w-full flex-col gap-1">
                <p className="truncate text-sm">{currentAudio?.title}</p>

                <div className="flex items-center text-xs text-gray-400">
                  {voice && (
                    <>
                      <div className="flex items-center">
                        <div
                          className="mr-1 flex h-3 w-3 items-center justify-center rounded-full text-white"
                          style={{ background: voice.gradientColors }}
                        />
                        <span>{voice.name}</span>
                        <span className="mx-1">·</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center">
                    <IoTimeOutline className="mr-1 h-3 w-3" />
                    <span>{currentAudio?.createdAt || "Just now"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4">
              <div
                className="flex origin-bottom items-end gap-[2px]"
                style={{ height: "14px" }}
              >
                {[0, 0.2, 0.4, 0.6].map((delay, i) => (
                  <div
                    key={i}
                    className={`w-[2px] origin-bottom rounded-sm bg-black/50 transition-transform duration-300 ${
                      isPlaying ? "animate-waveform" : "scale-y-[0.2]"
                    }`}
                    style={{
                      height: "100%",
                      animationDelay: isPlaying ? `${delay}s` : "0s",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={downloadAudio}
                className="rounded-full p-1.5 hover:bg-gray-100"
              >
                <IoDownloadOutline className="h-5 w-5" />
              </button>
              <button
                onClick={togglePlayPause}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white"
              >
                {isPlaying ? (
                  <IoPause className="h-5 w-5" />
                ) : (
                  <IoPlay className="ml-0.5 h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
