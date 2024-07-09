// export type Message = {
//   type: 'user' | 'assistant'
//   content: string
//   attachment?: string
//   clipboardText?: string
//   ocrScreenContents?: string
// }

type WindowAttachment = {
  title: string
  thumbnailUrl?: string
}

export type UserMessage = {
  type: 'user'
  screenshot?: string
  clipboardText?: string
  audio?: string
  window?: WindowAttachment
  file?: string
  content: string
}

export type AssistantMessage = {
  type: 'assistant'
  content: string
}

export type Message = UserMessage | AssistantMessage

export type CompareResult = {
  overview: string[]
  grok: string[]
  claude: string[]
}

export interface TopBarProps {
  mode: 'assistant' | 'compare'
  setMode: (mode: 'assistant' | 'compare') => void
  onNewConversation: () => void
}
