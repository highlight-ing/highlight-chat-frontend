import { StateCreator } from 'zustand'
import { Prompt } from '@/types/supabase-helpers'

/**
 * The state of the current prompt being used in the editor.
 */

export interface PromptState {
  /**
   * Stores the actual prompt that is used to generate the response
   */
  prompt?: string
  /**
   * The selected prompt app object.
   */
  promptApp?: Prompt
  /**
   * The friendly name of the prompt, displayed to the user.
   */
  promptName?: string
  promptDescription?: string
  /**
   * The same as the app slug or ID
   */
  promptAppName?: string
}

export type PromptSlice = PromptState & {
  setPrompt: (prompt: PromptState) => void
  clearPrompt: () => void
}

export const initialPromptState: PromptState = {
  prompt: undefined,
  promptApp: undefined,
  promptName: undefined,
  promptDescription: undefined,
  promptAppName: undefined,
}

export const createPromptSlice: StateCreator<PromptSlice> = (set, get) => ({
  ...initialPromptState,
  setPrompt: (prompt: Partial<PromptState>) =>
    set({
      ...get(),
      ...prompt,
    }),
  clearPrompt: () => set(initialPromptState),
})
