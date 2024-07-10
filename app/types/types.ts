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
  fileTitle?: string
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
  onNewConversation: () => void
}

export interface ImageAttachment {
  type: 'image'
  value: string
  file?: File
}

export interface PdfAttachment {
  type: 'pdf'
  value: File
}

export interface AudioAttachment {
  type: 'audio'
  value: string
}

export type Attachment = ImageAttachment | PdfAttachment | AudioAttachment
