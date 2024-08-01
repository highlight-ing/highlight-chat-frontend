type WindowAttachment = {
  title: string
  thumbnailUrl?: string
}

export type BaseMessage = {
  role: 'user' | 'assistant';
  content: string;
}

export type UserMessage = BaseMessage & {
  role: 'user';
  context?: string;
  image_url?: string;
  ocr_text?: string;
  clipboard_text?: string;
  screenshot?: string
  audio?: string
  window?: WindowAttachment
  fileTitle?: string
}

export type AssistantMessage = BaseMessage & {
  role: 'assistant';
};

export type Message = UserMessage | AssistantMessage

export type CompareResult = {
  overview: string[]
  grok: string[]
  claude: string[]
}

export interface TopBarProps {
  showHistory?: boolean
  setShowHistory?: (show: boolean) => void
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

export type Attachment = ImageAttachment | PdfAttachment | AudioAttachment | ClipboardAttachment

export type AttachmentType = 'audio' | 'clipboard' | 'image' | 'pdf' | 'window'

export interface ChatHistoryItem {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  title: string
  system_prompt: string
}

export interface ModalObjectProps {
  id: string
  context?: Record<string, any>
}