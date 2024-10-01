import { Prompt } from '@/types/supabase-helpers'
import { addAttachmentsToFormData } from './attachmentUtils'

export interface FormDataContext {
  image?: string
  window_context?: string
}

export interface FormDataInputs {
  prompt: string
  conversationId: string
  llmProvider?: string
  attachedContext: AttachedContexts
  availableContexts: AvailableContexts
}

export interface TextFileAttachmentMetadata {
  type: 'text_file'
  name: string
  text: string
  words: number
  created_at: Date
}

// Can be PDF, or spreadsheets
export interface FileAttachmentMetadata {
  name: string
  type: 'file_attachment'
  words: number
  created_at: Date
  file_type: string
}

export interface ImageAttachmentMetadata {
  type: 'image'
  file_id: string
}

export interface PDFAttachment {
  type: 'pdf'
  name: string
  file_id: string
}

// Visible text that has been OCR'ed
export interface OCRTextAttachment {
  type: 'ocr_text'
  text: string
  name: string
  words: number
  created_at: Date
}

export interface WindowContentsAttachment {
  type: 'window_contents'
  text: string
  name: string
  words: number
  created_at: Date
}

export interface WindowListAttachment {
  type: 'window_list'
  titles: Array<string>
}

export interface ClipboardTextAttachment {
  type: 'clipboard_text'
  text: string
}

export interface AboutMeAttachment {
  type: 'about_me'
  text: string
}

export interface ConversationAttachment {
  id: string
  type: 'conversation'
  title: string
  text: string
  started_at: string
  ended_at: string
}

export interface ConversationAttachmentMetadata {
  id: string
  type: 'conversation'
  title: string
  words: number
  started_at: string
  ended_at: string
}

export interface SpreadsheetAttachment {
  type: 'spreadsheet'
  contents: string
}

export interface AttachedContexts {
  context: Array<
    | TextFileAttachmentMetadata
    | FileAttachmentMetadata
    | ImageAttachmentMetadata
    | PDFAttachment
    | OCRTextAttachment
    | WindowContentsAttachment
    | WindowListAttachment
    | ClipboardTextAttachment
    | AboutMeAttachment
    | ConversationAttachment
  >
}

export interface AvailableContexts {
  context: Array<WindowListAttachment | ConversationAttachmentMetadata>
}

export const buildFormData = async ({
  prompt,
  conversationId,
  llmProvider = 'anthropic',
  attachedContext,
  availableContexts,
}: FormDataInputs): Promise<FormData> => {
  const formData = new FormData()

  // Append basic fields
  formData.append('prompt', prompt)
  formData.append('conversation_id', conversationId)
  formData.append('llm_provider', llmProvider)

  // Append attached_context_metadata
  const attachedContextMetadata = JSON.stringify(attachedContext)
  formData.append('attached_context', attachedContextMetadata)

  // Append available_context_metadata
  const availableContextMetadata = JSON.stringify(availableContexts)
  formData.append('available_context', availableContextMetadata)

  return formData
}
