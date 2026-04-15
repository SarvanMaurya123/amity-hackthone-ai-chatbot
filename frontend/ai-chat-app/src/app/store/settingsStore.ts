import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  inferenceModel: string;
  apiKey: string;
  visualTheme: "light" | "dark";
  privacyShield: boolean;
  tokensUsed: string;
  aiProjects: number;
  
  // Actions
  setInferenceModel: (model: string) => void;
  setApiKey: (key: string) => void;
  setVisualTheme: (theme: "light" | "dark") => void;
  setPrivacyShield: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      inferenceModel: "Luminous-Ultra-v4 (Default)",
      apiKey: "sk-luminous-test-key-2024",
      visualTheme: "dark",
      privacyShield: true,
      tokensUsed: "1.2M",
      aiProjects: 142,

      setInferenceModel: (model) => set({ inferenceModel: model }),
      setApiKey: (key) => set({ apiKey: key }),
      setVisualTheme: (theme) => set({ visualTheme: theme }),
      setPrivacyShield: (enabled) => set({ privacyShield: enabled }),
    }),
    {
      name: "luminous-settings",
    }
  )
);
