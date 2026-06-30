import { create } from "zustand";

export type AudioFormat = "wav" | "mp3" | "ogg" | "flac";

interface AudioConfigState {
  speed: number;
  stability: number;
  styleExaggeration: number;
  format: AudioFormat;
  setSpeed: (speed: number) => void;
  setStability: (stability: number) => void;
  setStyleExaggeration: (styleExaggeration: number) => void;
  setFormat: (format: AudioFormat) => void;
  reset: () => void;
}

const DEFAULTS = {
  speed: 1.0,
  stability: 0.5,
  styleExaggeration: 0.0,
  format: "wav" as AudioFormat,
};

export const useAudioConfig = create<AudioConfigState>((set) => ({
  ...DEFAULTS,
  setSpeed: (speed) => set({ speed }),
  setStability: (stability) => set({ stability }),
  setStyleExaggeration: (styleExaggeration) => set({ styleExaggeration }),
  setFormat: (format) => set({ format }),
  reset: () => set({ ...DEFAULTS }),
}));
