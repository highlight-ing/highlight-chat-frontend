import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { ChatHistoryItem, SharedMessage, SharedConversation, Message } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:8080'

export async function createShareLink(conversation: ChatHistoryItem): Promise<string> {
  const shareId = uuidv4()
  // TODO: Implement actual sharing logic with Supabase
  return `https://chat-new.highlight.ing/share/${shareId}`
}

export async function getSharedConversation(id: string): Promise<{ title: string; messages: Message[] } | null> {
  try {
    const url = `${API_BASE_URL}/api/v1/share-link/${id}/messages`
    console.log('Fetching from URL:', url) // Log the full URL

    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response not OK:', response.status, errorText)
      throw new Error(`Failed to fetch shared conversation: ${response.status} ${errorText}`)
    }
    const sharedMessages: SharedMessage[] = await response.json()

    // Convert SharedMessage to Message
    const messages: Message[] = sharedMessages.map((sm) => ({
      role: sm.role as 'user' | 'assistant',
      content: sm.content,
      ...(sm.role === 'user' && {
        ocr_text: sm.ocr_text,
        clipboard_text: sm.clipboard_text,
        image_url: sm.image_url,
        audio: sm.audio,
        file_title: sm.text_file,
        windows: sm.windows,
        window: sm.window_context,
      }),
    }))

    return {
      title: 'Shared Conversation', // You might want to fetch the title separately or include it in the response
      messages,
    }
  } catch (error) {
    console.error('Error fetching shared conversation:', error)
    return null
  }
}
