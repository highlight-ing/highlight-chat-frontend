type AvailableConversation = {
  type: 'available_conversation'
  id?: string
  title?: string
  words?: number
  started_at?: string
  ended_at?: string
}

type WindowList = {
  type: 'window_list'
  name: string[]
}

type AvailableContext = {
  id?: string
  context: (WindowList | AvailableConversation)[]
}

type AttachedConversation = {
  id?: string
  title?: string
  words?: number
  transcript?: string
  started_at?: string
  ended_at?: string
}

type AttachedConversationList = {
  type: 'conversation'
  conversations: AttachedConversation[]
}

type FileAttachment = {
  id?: string
  file_type?: 'pdf' | 'spreadsheet' | 'text_file' | 'image' | string
  name?: string
  content?: string
  words?: number
  created_at?: number
}

type FileAttachmentList = {
  type: 'file_attachment'
  attachments: FileAttachment[]
}

type ScreenImage = {
  type: 'screen_image'
  id?: string
  file_type?: string
  base64?: string
}

type WindowContents = {
  type: 'window_contents'
  id?: string
  text?: string
}

type OCRText = {
  type: 'ocr_text'
  id?: string
  text?: string
}

type ClipboardText = {
  type: 'clipboard_text'
  id?: string
  text?: string
}

type AboutMe = {
  type: 'about_me'
  id?: string
  text?: string
}

type AttachedContext = {
  context: (
    | AttachedConversationList
    | FileAttachmentList
    | ScreenImage
    | WindowContents
    | OCRText
    | ClipboardText
    | AboutMe
    | { type: string; [key: string]: any }
  )[]
}

type TestCase = {
  prompt: string
  conversation_id?: string
  attached_context?: AttachedContext
  available_context?: AvailableContext
}

type LLMResponse = {
  id?: string
  answer?: string
  function_call?: Record<string, any>
  is_correct?: boolean
}

type TestChatRequest = {
  prompt: string
  conversation_id?: string
  app_id?: string
  system_prompt?: string
  attached_context?: AttachedContext
  available_context?: AvailableContext
  llm_provider?: string
}

export type {
  AvailableConversation,
  WindowList,
  AvailableContext,
  AttachedConversation,
  AttachedConversationList,
  FileAttachment,
  FileAttachmentList,
  ScreenImage,
  WindowContents,
  OCRText,
  ClipboardText,
  AboutMe,
  AttachedContext,
  TestCase,
  LLMResponse,
  TestChatRequest,
}
