import { StateCreator } from 'zustand'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'

export type PromptEditorScreen = 'startWithTemplate' | 'app' | 'suggestions' | 'settings'

export interface PromptEditorData {
  name: string
  description: string
  appPrompt: string
  suggestionsPrompt: string
  visibility: 'public' | 'private'
}

export interface PromptEditorState {
  selectedScreen: PromptEditorScreen
  promptEditorData: PromptEditorData
}

export type PromptEditorSlice = PromptEditorState & {
  setSelectedScreen: (screen: PromptEditorScreen) => void
  setPromptEditorData: (data: Partial<PromptEditorData>) => void
  clearPromptEditorData: () => void
}

export const initialPromptEditorState: PromptEditorState = {
  selectedScreen: 'startWithTemplate',
  promptEditorData: {
    appPrompt: '',
    suggestionsPrompt: '',
    name: '',
    description: '',
    visibility: 'public',
  },
}

export const createPromptEditorSlice: StateCreator<PromptEditorSlice> = (set, get) => ({
  ...initialPromptEditorState,
  setSelectedScreen: (screen: PromptEditorScreen) => set({ selectedScreen: screen }),
  setPromptEditorData: (data: Partial<PromptEditorData>) =>
    set({ promptEditorData: { ...get().promptEditorData, ...data } }),
  clearPromptEditorData: () => set({ promptEditorData: initialPromptEditorState.promptEditorData }),
})

export const usePromptEditorStore = () =>
  useStore(
    useShallow((state) => ({
      selectedScreen: state.selectedScreen,
      setSelectedScreen: state.setSelectedScreen,
      promptEditorData: state.promptEditorData,
      setPromptEditorData: state.setPromptEditorData,
      clearPromptEditorData: state.clearPromptEditorData,
    })),
  )
