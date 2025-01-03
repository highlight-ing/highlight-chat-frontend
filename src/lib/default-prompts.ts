type ContextTypes = {
  window: boolean
  screenshot: boolean
  selected_text: boolean
  clipboard_text: boolean
  audio_transcription: boolean
}

type PromptPreference = {
  application_name_darwin: string
  application_name_win32: string
  context_types: ContextTypes
}

export const DEFAULT_PROMPT_IDS = [
  87585, 87570, 87832, 87680, 87831, 87679, 87602, 87603, 87683, 87684, 87586, 87830, 87605, 87606,
] as const

export const DEFAULT_PROMPT_PREFERENCES: Record<number, PromptPreference> = {
  // Complete Text
  87585: {
    application_name_darwin: '["Safari","Google Chrome","Discord","Notion","Slack"]',
    application_name_win32: '["Safari","Google Chrome","Discord","Notion","Slack"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Complete Code
  87602: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: true,
      audio_transcription: false,
    },
  },
  // Draft Response
  87605: {
    application_name_darwin: '*',
    application_name_win32: '*',
    context_types: {
      window: false,
      screenshot: true,
      selected_text: true,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Refactor Code- 87831
  87831: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: true,
      screenshot: false,
      selected_text: true,
      clipboard_text: true,
      audio_transcription: false,
    },
  },
  // Fix Code
  87603: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: true,
      audio_transcription: false,
    },
  },
  // Code Review- 87832
  87832: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: true,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Explain Code
  87679: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: true,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Draft Reply
  87680: {
    application_name_darwin: '["Slack"]',
    application_name_win32: '["Slack"]',
    context_types: {
      window: true,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Quick Recap
  87683: {
    application_name_darwin: '*',
    application_name_win32: '*',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: true,
    },
  },
  // Rewrite
  87570: {
    application_name_darwin: '["Slack","Safari","Google Chrome","Notion","Discord"]',
    application_name_win32: '["Slack","Safari","Google Chrome","Notion","Discord"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: true,
      audio_transcription: false,
    },
  },
  // Follow Up
  87684: {
    application_name_darwin: '*',
    application_name_win32: '*',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: true,
    },
  },
  // Meeting Summary- 87830
  87830: {
    application_name_darwin: '*',
    application_name_win32: '*',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: true,
    },
  },
  // Improve Text
  87586: {
    application_name_darwin: '["Slack","Google Chrome"]',
    application_name_win32: '["Slack","Google Chrome"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Proof Read
  87606: {
    application_name_darwin: '["Safari"]',
    application_name_win32: '["Safari"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
} as const

export type DefaultPromptPreferences = typeof DEFAULT_PROMPT_PREFERENCES
