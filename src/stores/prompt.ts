import { StateCreator } from "zustand";

export interface PromptState {
  promptName?: string;
  promptDescription?: string;
}

export type PromptSlice = PromptState & {
  setPrompt: (prompt: PromptState) => void;
  clearPrompt: () => void;
};

export const initialPromptState: PromptState = {
  promptName: undefined,
  promptDescription: undefined,
};

export const createPromptSlice: StateCreator<PromptSlice> = (set) => ({
  ...initialPromptState,
  setPrompt: (prompt: PromptState) =>
    set({
      promptName: prompt.promptName,
      promptDescription: prompt.promptDescription,
    }),
  clearPrompt: () => set(initialPromptState),
});
