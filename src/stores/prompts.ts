import { StateCreator } from 'zustand'
import { Prompt } from '@/types/supabase-helpers'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'

/**
 * Stores all the prompts available to the user,
 * including ones that they own.
 */

export interface PromptsState {
  promptUserId?: string | undefined
  prompts: Prompt[]
}

export type PromptsSlice = PromptsState & {
  setPrompts: (prompts: Prompt[]) => void
  setPromptUserId: (userId: string | undefined) => void
  updatePrompt: (prompt: Prompt) => void
  removePrompt: (externalId: string) => void
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
  removePrompt: (externalId: string) => {
    set({
      prompts: get().prompts.filter((p) => p.external_id !== externalId),
    })
  },
})

export const usePromptsStore = () =>
  useStore(
    useShallow((state) => ({
      prompts: state.prompts,
      setPrompts: state.setPrompts,
      promptUserId: state.promptUserId,
      setPromptUserId: state.setPromptUserId,
      updatePrompt: state.updatePrompt,
      removePrompt: state.removePrompt,
    })),
  )
