import { Prompt } from '@/types/supabase-helpers'
import { ColorScheme } from '@/components/PersonalPrompts/customVariables'
import { ButtonVariantType } from '@/components/Button/Button'

type WindowAttachment = {
  type: 'window'
  title: string
  appIcon?: string
}

export type BaseMessage = {
  role: 'user' | 'assistant'
  content?: string
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
  factIndex?: number
  fact?: string
}

export type AssistantMessage = BaseMessage & {
  role: 'assistant'
  factIndex?: number
  fact?: string
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

export interface ConversationAttachment {
  type: 'conversation'
  value: string
}

export type FileAttachment =
  | PdfAttachment
  | ImageAttachment
  | SpreadsheetAttachment
  | TextFileAttachment
  | WindowContextAttachment

export type Attachment =
  | AudioAttachment
  | ClipboardAttachment
  | WindowAttachment
  | FileAttachment
  | WindowContextAttachment
  | ConversationAttachment

export type FileAttachmentType = 'image' | 'pdf' | 'spreadsheet' | 'text_file'
export type AttachmentType = 'audio' | 'clipboard' | 'window' | 'window_context' | 'conversation' | FileAttachmentType

export interface ChatHistoryItem {
  app_id?: string | null
  created_at: string
  id: string
  title: string
  updated_at: string
  user_id: string
  shared_conversations?: {
    created_at: string
    id: string
    title: string
  }[]
}

export interface ModalObjectProps {
  id: string
  context?: Record<string, any>
}

export interface ToastAction {
  label?: string | React.ReactElement
  variant?: ButtonVariantType
  onClick: (event: React.MouseEvent) => void
}

export interface Toast {
  id: string
  title?: string
  subtext?: string
  description?: string
  timeout?: number
  type?: 'default' | 'success' | 'error'
  action?: ToastAction
  onClose?: () => void
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

export type PlatformType = 'windows' | 'mac' | 'mobile' | 'unsupported' | 'unknown'
export type DownloadPlatformType = 'windows' | 'mac-intel' | 'mac-silicon' | 'unsupported'

// Prompt editor types
export type PromptTag = {
  value: string
  label: string
}

export interface PersonalPromptsProps {
  userId: string | undefined
  prompts: Prompt[]
  pinnedPrompts: PinnedPrompt[]
}

export interface PersonalPromptsItemProps {
  prompt: Prompt
  colorScheme: ColorScheme
  isOwner: boolean
  isPublic: boolean
}

// Type for the pinned prompt based on PROMPTS_TABLE_SELECT_FIELDS
export type PinnedPrompt = {
  external_id: string
  name: string
  description: string | null
  prompt_text: string | null
  created_at: string
  slug: string
  user_id: string
  image: string | null
  user_images: {
    file_extension: string
  } | null
  public_use_number: number
} & { isPinned?: boolean }

export const APP_PROMPT_COMMENT =
  "{{! These are comments, they won't effect the output of your app }}\n{{! The app prompt determines how your app will behave to the user. }}\n"

export interface GeneratedPrompt {
  text: string
  index: number
}

export interface LLMMessage {
  content: string
  role: 'system' | 'user'
}

export type CopyState = 'idle' | 'copying' | 'copied' | 'hiding'
