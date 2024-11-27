import { UserMessage } from '@/types'

export function preprocessLaTeX(content: string) {
  const blockProcessedContent = content.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`)
  return blockProcessedContent.replace(/\\\((.*?)\\\)/g, (_, equation) => `$${equation}$`)
}

export function hasAttachment(message: UserMessage) {
  return (
    message.screenshot ||
    message.clipboard_text ||
    message.window_context ||
    message.window ||
    message.file_title ||
    message.audio ||
    message.image_url ||
    (message.file_attachments && message.file_attachments.length > 0)
  )
}
