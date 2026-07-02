"use client";

import { useEffect, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { useVoiceStore } from "~/stores/voice-store";
import { ServiceType } from "~/types/services";

export function VoiceSelector({ service }: { service: ServiceType }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getVoices = useVoiceStore((state) => state.getVoices);
  const getSelectedVoice = useVoiceStore((state) => state.getSelectedVoice);
  const selectVoice = useVoiceStore((state) => state.selectVoice);

  const voices = getVoices(service);
  const selectedVoice = getSelectedVoice(service);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-secondary"
      >
        <span className="flex items-center gap-2.5">
          <span
            className="block h-3.5 w-3.5 flex-shrink-0 rounded-full"
            style={{ background: selectedVoice?.gradientColors }}
          />
          <span className="text-text-primary">
            {selectedVoice?.name ?? "Select a voice"}
          </span>
        </span>
        <IoChevronDown
          className={`h-4 w-4 text-text-tertiary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-20 mt-1.5 max-h-64 overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
          {voices.map((voice) => {
            const isSelected = voice.id === selectedVoice?.id;
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => {
                  selectVoice(service, voice.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-neutral-100 text-text-primary"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                <span
                  className="block h-3.5 w-3.5 flex-shrink-0 rounded-full"
                  style={{ background: voice.gradientColors }}
                />
                <span className="flex-1">{voice.name}</span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
