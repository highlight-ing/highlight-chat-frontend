import { PromptTag } from '@/types'
import { StateCreator } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { PreferredAttachment } from '@/lib/zod'
import { useStore } from '@/components/providers/store-provider'

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

export interface EnabledAutomations {
  createLinearIssue: boolean
  createNotionPage: boolean
  enableAgentMode: boolean
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
  roleplay: boolean
  videoUrl?: string
  image?: string
  uploadingImage?: File
  preferredAttachment?: PreferredAttachment
  enabledAutomations: EnabledAutomations
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
{{#if user_message}}
# User Message
The phrases "user message", "user input", "typed message", "question" refer to the following:

User Message: {{user_message}}
{{/if}}


{{! Handle references to what data is in the user's "about me" }}
{{#if about_me}}
# About Me
The phrases "about me", "about the user", "user personalization" refer to the following:

About Me: {{about_me}}
{{/if}}

{{! Handle references to the text retrieved for the focused app }}
{{#if window_context}}
# App Text
The phrases "app text", "window context", "window text", "app context", "focused app" refer to the following:

App text: {{window_context}}
{{/if}}


{{! Handle references to the entire screen text }}
{{#if (or screen image)}}
# Screen
The phrases "screen contents", "screen data", "screen text", "on my screen" refer to the following:

{{#if screen}}
Screen text: {{screen}}
{{/if}}

{{#if image}}
Image for additional context: {{image}}
{{/if}}
{{/if}}


{{! Handle references to the attached screenshot }}
{{#if image}}
# Screenshot
The phrases "screenshot", "screen shot", "screenshots" refer to the following:

Screenshot: {{image}}
{{/if}}


{{! Handle references to transcribed audio }}
{{#if audio}}
# Audio
The phrases "audio", "conversation", "call", "meeting", "transcript" refer to the following:

Audio: {{audio}}
{{/if}}


{{! Handle references to what apps the user has open on their PC }}
{{#if windows}}
# Open Windows
The phrases "open windows", "open apps", "active programs", "running programs", "active apps", "running apps" refer to the following:

Open Windows: {{windows}}
{{/if}}


{{! Handle references to what data is in the user's clipboard }}
{{#if clipboard_text}}
# Clipboard
The phrases "clipboard", "clipboard text", "my clipboard" refer to the following:

Clipboard Text: {{clipboard_text}}
{{/if}}
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
    roleplay: false,
    tags: [],
    preferredAttachment: 'default',
    enabledAutomations: {
      createLinearIssue: false,
      createNotionPage: false,
      enableAgentMode: false,
    },
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
