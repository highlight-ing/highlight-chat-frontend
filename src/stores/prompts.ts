import { StateCreator } from 'zustand'
import { Prompt } from '@/types/supabase-helpers'

export interface PromptsState {
  promptUserId?: string | undefined
  prompts: Prompt[]
}

export type PromptsSlice = PromptsState & {
  setPrompts: (prompts: Prompt[]) => void
  setPromptUserId: (userId: string | undefined) => void
  updatePrompt: (prompt: Prompt) => void
}

export const initialPromptsState: PromptsState = {
  promptUserId: undefined,
  prompts: [],
}

export const createPromptsSlice: StateCreator<PromptsSlice> = (set, get) => ({
  ...initialPromptsState,
  setPrompts: (prompts: Prompt[]) => {
    set({
      prompts,
    })
  },
  setPromptUserId: (userId: string | undefined) => {
    set({
      promptUserId: userId,
    })
  },
  updatePrompt: (prompt: Prompt) => {
    set({
      prompts: get().prompts.map((p) =>
        p.external_id === prompt.external_id
          ? {
              ...p,
              ...prompt,
            }
          : p,
      ),
    })
  },
})
