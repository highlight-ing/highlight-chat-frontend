import { StateCreator } from 'zustand'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { PromptTag } from '@/types'
/**
 * Holds the state for the prompt editor,
 * when the user is creating or editing a prompt.
 */

export type PromptEditorScreen = 'startWithTemplate' | 'app' | 'suggestions' | 'settings'

export interface PromptEditorData {
  externalId?: string
  slug: string
  name: string
  description: string
  tags?: PromptTag[]
  appPrompt: string
  suggestionsPrompt: string
  visibility: 'public' | 'private'
  videoUrl?: string
  image?: string
  uploadingImage?: File
}

export interface PromptEditorState {
  selectedScreen: PromptEditorScreen
  promptEditorData: PromptEditorData
  needSave: boolean
  saving: boolean
  settingsHasNoErrors: boolean
}

export type PromptEditorSlice = PromptEditorState & {
  setSelectedScreen: (screen: PromptEditorScreen) => void
  setPromptEditorData: (data: Partial<PromptEditorData>, skipNeedSave?: boolean) => void
  clearPromptEditorData: () => void
  setNeedSave: (needSave: boolean) => void
  setSaving: (saving: boolean) => void
  setSettingsHasNoErrors: (hasSettingsError: boolean) => void
}

export const initialPromptEditorState: PromptEditorState = {
  selectedScreen: 'startWithTemplate',
  promptEditorData: {
    slug: '',
    appPrompt: '',
    suggestionsPrompt: '',
    name: '',
    description: '',
    visibility: 'private',
    tags: [],
  },
  needSave: false,
  saving: false,
  settingsHasNoErrors: false,
}

export const createPromptEditorSlice: StateCreator<PromptEditorSlice> = (set, get) => ({
  ...initialPromptEditorState,
  setSelectedScreen: (screen: PromptEditorScreen) => set({ selectedScreen: screen }),
  setPromptEditorData: (data: Partial<PromptEditorData>, skipNeedSave?: boolean) =>
    set({ promptEditorData: { ...get().promptEditorData, ...data }, needSave: !skipNeedSave }),
  clearPromptEditorData: () => set({ promptEditorData: initialPromptEditorState.promptEditorData }),
  setNeedSave: (needSave: boolean) => set({ needSave }),
  setSaving: (saving: boolean) => set({ saving }),
  setSettingsHasNoErrors: (settingsHasNoErrors: boolean) => set({ settingsHasNoErrors }),
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
      settingsHasNoErrors: state.settingsHasNoErrors,
      setSettingsHasNoErrors: state.setSettingsHasNoErrors,
    })),
  )
