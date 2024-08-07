import { StateCreator } from "zustand";
import {PromptApp} from "@/types";

export interface PromptState {
  /**
   * Stores the actual prompt that is used to generate the response
   */
  prompt?: string;
  /**
   * The selected prompt app object.
   */
  promptApp?: PromptApp;
  /**
   * The friendly name of the prompt, displayed to the user.
   */
  promptName?: string;
  promptDescription?: string;
  /**
   * The same as the app slug or ID
   */
  promptAppName?: string;
}

export type PromptSlice = PromptState & {
  setPrompt: (prompt: PromptState) => void;
  clearPrompt: () => void;
};

export const initialPromptState: PromptState = {
  prompt: undefined,
  promptApp: undefined,
  promptName: undefined,
  promptDescription: undefined,
  promptAppName: undefined,
};

export const createPromptSlice: StateCreator<PromptSlice> = (set, get) => ({
  ...initialPromptState,
  setPrompt: (prompt: Partial<PromptState>) =>
    set({
      ...get(),
      ...prompt,
    }),
  clearPrompt: () => set(initialPromptState),
});
