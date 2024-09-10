import { StateCreator } from 'zustand'
import { Prompt } from '@/types/supabase-helpers'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'

/**
 * The state of the current prompt being used in the editor.
 */

export interface PreviewPromptState {
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
  promptImage?: string
  promptName?: string
  promptDescription?: string
  promptTags?: string[]

  /**
   * The prompt's `prompt_text` field from the database.
   */
  promptText?: string
  /**
   * The same as the app slug or ID
   */
  promptAppName?: string

  isPromptApp?: boolean
}

export type PreviewPromptSlice = PreviewPromptState & {
  setPrompt: (prompt: PreviewPromptState) => void
  clearPrompt: () => void
  setIsPromptApp: (isPromptApp: boolean) => void
}

export const initialPreviewPromptState: PreviewPromptState = {
  prompt: undefined,
  promptApp: undefined,
  promptImage: undefined,
  promptName: undefined,
  promptDescription: undefined,
  promptAppName: undefined,
  isPromptApp: false,
}

export const createPreviewPromptSlice: StateCreator<PreviewPromptSlice> = (set, get) => ({
  ...initialPreviewPromptState,
  setPrompt: (prompt: Partial<PreviewPromptState>) =>
    set({
      ...get(),
      ...prompt,
    }),
  clearPrompt: () => set(initialPreviewPromptState),
  setIsPromptApp: (isPromptApp: boolean) => set({ isPromptApp }),
})

export const usePreviewPromptStore = () =>
  useStore(
    useShallow((state) => ({
      setPrompt: state.setPrompt,
      clearPrompt: state.clearPrompt,
      setIsPromptApp: state.setIsPromptApp,
    })),
  )
