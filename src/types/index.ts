type WindowAttachment = {
  type: 'window'
  title: string
  appIcon?: string
}

export type BaseMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type UserMessage = BaseMessage & {
  role: 'user'
  context?: string
  image_url?: string
  ocr_text?: string
  clipboard_text?: string
  screenshot?: string
  audio?: string
  window?: WindowAttachment
  file_title?: string
  windows?: string[]
  file_attachments?: Attachment[]
  window_context?: string
}

export type AssistantMessage = BaseMessage & {
  role: 'assistant'
}

export type Message = UserMessage | AssistantMessage

export type CompareResult = {
  overview: string[]
  grok: string[]
  claude: string[]
}

export interface TopBarProps {
  showHistory: boolean
  setShowHistory: (show: boolean) => void
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
  duration: number // in minutes
}

export interface ClipboardAttachment {
  type: 'clipboard'
  value: string
}

export interface TextFileAttachment {
  type: 'text_file'
  value: string
  fileName: string
}
export interface WindowContextAttachment {
  type: 'window_context'
  value: string
}
export interface SpreadsheetAttachment {
  type: 'spreadsheet'
  value: File
}

export type FileAttachment = PdfAttachment | ImageAttachment | SpreadsheetAttachment | TextFileAttachment

export type Attachment =
  | AudioAttachment
  | ClipboardAttachment
  | WindowAttachment
  | FileAttachment
  | WindowContextAttachment

export type FileAttachmentType = 'image' | 'pdf' | 'spreadsheet' | 'text_file'
export type AttachmentType = 'audio' | 'clipboard' | 'window' | 'window_context' | FileAttachmentType

export interface ChatHistoryItem {
  app_id?: string | null
  created_at: string
  id: string
  title: string
  updated_at: string
  user_id: string
}

export interface ModalObjectProps {
  id: string
  context?: Record<string, any>
}

export interface Toast {
  id: string
  title?: string
  subtext?: string
  description?: string
  timeout?: number
  type?: 'default' | 'success' | 'error'
}

export interface SharedMessage {
  role: 'user' | 'assistant'
  content: string
  ocr_text?: string
  clipboard_text?: string
  image_url?: string
  audio?: string
  text_file?: string
  windows?: any[]
  window_context?: any
  created_at: string
}

export interface SharedChat {
  id: string
  title: string
  created_at: string
  app_id?: string
  user_id?: string
  messages: Message[]
}

export type AssistantMessageButtonType = 'Copy' | 'Share' | 'Save' | 'SendFeedback'

export type AssistantMessageButtonStatus = 'idle' | 'success'

export type AssistantMessageButtonConfig = {
  type: AssistantMessageButtonType
  onClick: () => void
  status: AssistantMessageButtonStatus
}
