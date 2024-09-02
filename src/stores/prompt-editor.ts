import { StateCreator } from 'zustand'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { PromptTag } from '@/types'
/**
 * Holds the state for the prompt editor,
 * when the user is creating or editing a prompt.
 */

export type PromptEditorScreen = 'startWithTemplate' | 'app' | 'settings' | 'variables'

export interface PromptEditorOnboarding {
  /**
   * Where we currently are in the onboarding process.
   */
  index: number
  isOnboarding: boolean
  hasOnboardedOnceBefore: boolean
}

export interface PromptEditorData {
  externalId?: string
  slug: string
  name: string
  description: string
  tags?: PromptTag[]
  appPrompt: string
  systemPrompt: string
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
  onboarding: PromptEditorOnboarding
}

export type PromptEditorSlice = PromptEditorState & {
  setSelectedScreen: (screen: PromptEditorScreen) => void
  setPromptEditorData: (data: Partial<PromptEditorData>, skipNeedSave?: boolean) => void
  clearPromptEditorData: () => void
  setNeedSave: (needSave: boolean) => void
  setSaving: (saving: boolean) => void
  setSettingsHasNoErrors: (hasSettingsError: boolean) => void
  setOnboarding: (onboarding: Partial<PromptEditorOnboarding>) => void
  startTutorial: () => void
}

export const DEFAULT_SYSTEM_PROMPT = `
{{!

System Prompt

The system prompt defines language to resolve variables against.
This lets you write prompts in plain english without thinking about the handlebars syntax.

}}


{{! Handle references to the user message }}
# User Message
The phrases "user message", "user input", "typed message", "question" refer to the following:

User Message: {{user_message}}


{{! Handle references to the text retrieved for the focused app }}
# App Text
The phrases "app text", "window context", "window text", "app context", "focused app" refer to the following:

App text: {{window_context}}


{{! Handle references to the entire screen text }}
# Screen
The phrases "screen contents", "screen data", "screen text", "on my screen" refer to the following:

Screen text: {{screen}}
Image for additional context: {{image}}


{{! Handle references to the attached screenshot }}
# Screenshot
The phrases "screenshot", "screen shot", "screenshots" refer to the following:

Screenshot: {{image}}


{{! Handle references to transcribed audio }}
# Audio
The phrases "audio", "conversation", "call", "meeting", "transcript" refer to the following:

Audio: {{audio}}


{{! Handle references to what apps the user has open on their PC }}
# Open Windows
The phrases "open windows", "open apps", "active programs", "running programs", "active apps", "running apps" refer to the following:

Open Windows: {{windows}}


{{! Handle references to what data is in the user's clipboard }}
# Clipboard
The phrases "clipboard", "clipboard text", "my clipboard" refer to the following:

{{clipboard_text}}

`

export const initialPromptEditorState: PromptEditorState = {
  selectedScreen: 'startWithTemplate',
  promptEditorData: {
    slug: '',
    appPrompt: '',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    name: '',
    description: '',
    visibility: 'private',
    tags: [],
  },
  needSave: false,
  saving: false,
  settingsHasNoErrors: false,
  onboarding: {
    index: 0,
    isOnboarding: false,
    hasOnboardedOnceBefore: false,
  },
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
  setOnboarding: (onboarding: Partial<PromptEditorOnboarding>) =>
    set({
      onboarding: {
        ...get().onboarding,
        ...onboarding,
      },
    }),
  startTutorial: () =>
    set({ onboarding: { isOnboarding: true, index: 0, hasOnboardedOnceBefore: true }, selectedScreen: 'app' }),
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
      onboarding: state.onboarding,
      setOnboarding: state.setOnboarding,
      startTutorial: state.startTutorial,
    })),
  )
