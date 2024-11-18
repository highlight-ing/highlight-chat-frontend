import { PinnedPrompt } from '@/types'
import { StateCreator } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { Prompt } from '@/types/supabase-helpers'
import { useStore } from '@/components/providers/store-provider'

import { Store } from '.'

/**
 * Stores all the prompts available to the user,
 * including ones that they own.
 */
export interface PromptsState {
  promptUserId?: string | undefined
  prompts: Prompt[]
  isPromptsLoaded: boolean
  isPinnedPromptsLoading: boolean
  pinnedPrompts: PinnedPrompt[]
}

export type PromptsSlice = PromptsState & {
  setPrompts: (prompts: Prompt[]) => void
  setPromptUserId: (userId: string | undefined) => void
  updatePrompt: (prompt: Prompt) => void
  removePrompt: (externalId: string) => void
  addPrompt: (prompt: Prompt) => void
  setIsPromptsLoaded: (isPromptsLoaded: boolean) => void
  setIsPinnedPromptsLoading: (isPinnedPromptsLoading: boolean) => void
  setPinnedPrompts: (pinnedPrompts: PinnedPrompt[]) => void
}

export const initialPromptsState: PromptsState = {
  promptUserId: undefined,
  prompts: [],
  isPromptsLoaded: false,
  isPinnedPromptsLoading: false,
  pinnedPrompts: [],
}

export const createPromptsSlice: StateCreator<Store, [], [], PromptsSlice> = (set, get) => ({
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
    if (get().promptApp?.external_id === prompt.external_id) {
      set({
        promptApp: prompt,
      })
    }
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
  addPrompt: (prompt: Prompt) => {
    set({
      prompts: [...get().prompts, prompt],
    })
  },
  removePrompt: (externalId: string) => {
    set({
      prompts: get().prompts.filter((p) => p.external_id !== externalId),
    })
  },
  setIsPromptsLoaded: (isPromptsLoaded) => {
    set({ isPromptsLoaded })
  },
  setIsPinnedPromptsLoading: (isPinnedPromptsLoading) => {
    set({ isPinnedPromptsLoading })
  },
  setPinnedPrompts: (pinnedPrompts: PinnedPrompt[]) => {
    set({
      pinnedPrompts,
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
      addPrompt: state.addPrompt,
      pinnedPrompts: state.pinnedPrompts,
      setPinnedPrompts: state.setPinnedPrompts,
    })),
  )
