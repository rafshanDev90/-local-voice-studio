import { create } from "zustand";
import { ServiceType } from "~/types/services";

const GRADIENT_COLORS = [
  "linear-gradient(45deg, #8b5cf6, #ec4899, #ffffff, #3b82f6)",
  "linear-gradient(45deg, #3b82f6, #10b981, #ffffff, #f59e0b)",
  "linear-gradient(45deg, #ec4899, #f97316, #ffffff, #8b5cf6)",
  "linear-gradient(45deg, #10b981, #3b82f6, #ffffff, #f43f5e)",
  "linear-gradient(45deg, #f43f5e, #f59e0b, #ffffff, #10b981)",
];

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  gradientColors: string;
  service: ServiceType;
}

export const LANGUAGES: { code: string; label: string }[] = [
  { code: "en-us", label: "English (US)" },
  { code: "en-gb", label: "English (UK)" },
  { code: "bn-bd", label: "বাংলা (বাংলাদেশ)" },
  { code: "bn-in", label: "বাংলা (ভারত)" },
];

const VOICES: Voice[] = [
  { id: "af_bella",       name: "Bella",     language: "en-us", gender: "female", gradientColors: GRADIENT_COLORS[0]!, service: "styletts2" },
  { id: "af_nicole",      name: "Nicole",    language: "en-us", gender: "female", gradientColors: GRADIENT_COLORS[1]!, service: "styletts2" },
  { id: "af_sarah",       name: "Sarah",     language: "en-us", gender: "female", gradientColors: GRADIENT_COLORS[2]!, service: "styletts2" },
  { id: "af_sky",         name: "Sky",       language: "en-us", gender: "female", gradientColors: GRADIENT_COLORS[3]!, service: "styletts2" },
  { id: "am_adam",        name: "Adam",      language: "en-us", gender: "male",   gradientColors: GRADIENT_COLORS[4]!, service: "styletts2" },
  { id: "am_michael",     name: "Michael",   language: "en-us", gender: "male",   gradientColors: GRADIENT_COLORS[0]!, service: "styletts2" },
  { id: "bf_emma",        name: "Emma",      language: "en-gb", gender: "female", gradientColors: GRADIENT_COLORS[1]!, service: "styletts2" },
  { id: "bf_isabella",    name: "Isabella",  language: "en-gb", gender: "female", gradientColors: GRADIENT_COLORS[2]!, service: "styletts2" },
  { id: "bm_george",      name: "George",    language: "en-gb", gender: "male",   gradientColors: GRADIENT_COLORS[3]!, service: "styletts2" },
  { id: "bm_lewis",       name: "Lewis",     language: "en-gb", gender: "male",   gradientColors: GRADIENT_COLORS[4]!, service: "styletts2" },
  { id: "bn-bd-nabanita", name: "নবনীতা",   language: "bn-bd", gender: "female", gradientColors: GRADIENT_COLORS[0]!, service: "styletts2" },
  { id: "bn-bd-pradeep",  name: "প্রদীপ",    language: "bn-bd", gender: "male",   gradientColors: GRADIENT_COLORS[1]!, service: "styletts2" },
  { id: "bn-in-bashkar",  name: "বাশকার",    language: "bn-in", gender: "male",   gradientColors: GRADIENT_COLORS[2]!, service: "styletts2" },
  { id: "bn-in-tanishaa", name: "তানিশা",    language: "bn-in", gender: "female", gradientColors: GRADIENT_COLORS[3]!, service: "styletts2" },
];

const defaultVoice = VOICES.find((v) => v.id === "af_bella") ?? null;

interface VoiceState {
  voices: Voice[];
  selectedVoices: Record<ServiceType, Voice | null>;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  getVoices: (service: ServiceType, language?: string) => Voice[];
  getSelectedVoice: (service: ServiceType) => Voice | null;
  selectVoice: (service: ServiceType, voiceId: string) => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  voices: VOICES,
  selectedVoices: {
    styletts2: defaultVoice,
    seedvc: null,
    "make-an-audio": null,
  },
  selectedLanguage: "en-us",
  setSelectedLanguage: (lang) => {
    set({ selectedLanguage: lang });
    const current = get().selectedVoices.styletts2;
    if (current && current.language !== lang) {
      const first = get().voices.find(
        (v) => v.service === "styletts2" && v.language === lang,
      );
      if (first) {
        set((state) => ({
          selectedVoices: { ...state.selectedVoices, styletts2: first },
        }));
      }
    }
  },
  getVoices: (service, language) => {
    const all = get().voices.filter((v) => v.service === service);
    const lang = language ?? get().selectedLanguage;
    return all.filter((v) => v.language === lang);
  },
  getSelectedVoice: (service) => {
    return get().selectedVoices[service];
  },
  selectVoice: (service, voiceId) => {
    const serviceVoices = get().voices.filter(
      (voice) => voice.service === service,
    );
    const selectedVoice =
      serviceVoices.find((voice) => voice.id === voiceId) ?? serviceVoices[0] ?? null;
    set((state) => ({
      selectedVoices: {
        ...state.selectedVoices,
        [service]: selectedVoice,
      },
    }));
  },
}));
