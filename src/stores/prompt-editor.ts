import { StateCreator } from 'zustand'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'

export type PromptEditorScreen = 'startWithTemplate' | 'app' | 'suggestions' | 'settings'

export interface PromptEditorData {
  externalId?: string
  name: string
  description: string
  appPrompt: string
  suggestionsPrompt: string
  visibility: 'public' | 'private'
  videoUrl?: string
  imageUrl?: string
  uploadingImage?: File
}

export interface PromptEditorState {
  selectedScreen: PromptEditorScreen
  promptEditorData: PromptEditorData
  needSave: boolean
  saving: boolean
}

export type PromptEditorSlice = PromptEditorState & {
  setSelectedScreen: (screen: PromptEditorScreen) => void
  setPromptEditorData: (data: Partial<PromptEditorData>) => void
  clearPromptEditorData: () => void
  setNeedSave: (needSave: boolean) => void
  setSaving: (saving: boolean) => void
}

export const initialPromptEditorState: PromptEditorState = {
  selectedScreen: 'startWithTemplate',
  promptEditorData: {
    appPrompt: '',
    suggestionsPrompt: '',
    name: '',
    description: '',
    visibility: 'private',
  },
  needSave: false,
  saving: false,
}

export const createPromptEditorSlice: StateCreator<PromptEditorSlice> = (set, get) => ({
  ...initialPromptEditorState,
  setSelectedScreen: (screen: PromptEditorScreen) => set({ selectedScreen: screen }),
  setPromptEditorData: (data: Partial<PromptEditorData>) =>
    set({ promptEditorData: { ...get().promptEditorData, ...data }, needSave: true }),
  clearPromptEditorData: () => set({ promptEditorData: initialPromptEditorState.promptEditorData }),
  setNeedSave: (needSave: boolean) => set({ needSave }),
  setSaving: (saving: boolean) => set({ saving }),
})

export const usePromptEditorStore = () =>
  useStore(
    useShallow((state) => ({
      selectedScreen: state.selectedScreen,
      setSelectedScreen: state.setSelectedScreen,
      promptEditorData: state.promptEditorData,
      setPromptEditorData: state.setPromptEditorData,
      clearPromptEditorData: state.clearPromptEditorData,
      needSave: state.needSave,
      setNeedSave: state.setNeedSave,
      saving: state.saving,
      setSaving: state.setSaving,
    })),
  )
