import { StateCreator } from "zustand";
import {PromptApp} from "@/types";

export interface PromptsState {
  promptUserId?: string | undefined
  prompts: PromptApp[];
}

export type PromptsSlice = PromptsState & {
  setPrompts: (prompts: PromptApp[]) => void;
  setPromptUserId: (userId: string | undefined) => void;
};

export const initialPromptsState: PromptsState = {
  promptUserId: undefined,
  prompts: [],
};

export const createPromptsSlice: StateCreator<PromptsSlice> = (set, get) => ({
  ...initialPromptsState,
  setPrompts: (prompts: PromptApp[]) => {
    set({
      prompts
    })
  },
  setPromptUserId: (userId: string | undefined) => {
    set({
      promptUserId: userId
    })
  },
});
