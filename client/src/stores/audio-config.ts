import { create } from "zustand";

interface AudioConfigState {
  speed: number;
  stability: number;
  styleExaggeration: number;
  setSpeed: (speed: number) => void;
  setStability: (stability: number) => void;
  setStyleExaggeration: (styleExaggeration: number) => void;
  reset: () => void;
}

const DEFAULTS = {
  speed: 1.0,
  stability: 0.5,
  styleExaggeration: 0.0,
};

export const useAudioConfig = create<AudioConfigState>((set) => ({
  ...DEFAULTS,
  setSpeed: (speed) => set({ speed }),
  setStability: (stability) => set({ stability }),
  setStyleExaggeration: (styleExaggeration) => set({ styleExaggeration }),
  reset: () => set({ ...DEFAULTS }),
}));
