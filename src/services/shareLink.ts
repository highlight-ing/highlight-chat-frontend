import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { ChatHistoryItem, SharedChat } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:8080'

export async function createShareLink(conversation: ChatHistoryItem): Promise<string> {
  const shareId = uuidv4()
  // TODO: Implement actual sharing logic with Supabase
  return `https://chat-new.highlight.ing/share/${shareId}`
}

export async function getSharedConversation(id: string): Promise<SharedChat | null> {
  try {
    const url = `${API_BASE_URL}/api/v1/share-link/${id}/messages`
    console.log('Fetching from URL:', url)

    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response not OK:', response.status, errorText)
      throw new Error(`Failed to fetch shared conversation: ${response.status} ${errorText}`)
    }

    const sharedChat: SharedChat = await response.json()

    return sharedChat
  } catch (error) {
    console.error('Error fetching shared conversation:', error)
    return null
  }
}

// export async function getSharedConversation(id: string): Promise<SharedConversation | null> {
//   try {
//     const url = `${API_BASE_URL}/api/v1/share-link/${id}/messages`
//     console.log('Fetching from URL:', url)

//     const response = await fetch(url)
//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error('Response not OK:', response.status, errorText)
//       throw new Error(`Failed to fetch shared conversation: ${response.status} ${errorText}`)
//     }
//     const data: SharedConversationResponse = await response.json()
//     console.log('Data:', data)
//     // Convert SharedMessage to Message
//     const messages: Message[] = data.messages.map((sm) => ({
//       role: sm.role as 'user' | 'assistant',
//       content: sm.content,
//       ...(sm.role === 'user' && {
//         ocr_text: sm.ocr_text,
//         clipboard_text: sm.clipboard_text,
//         image_url: sm.image_url,
//         audio: sm.audio,
//         file_title: sm.text_file,
//         windows: sm.windows,
//         window: sm.window_context,
//       }),
//     }))

//     return {
//       id: data.conversation.id,
//       title: data.conversation.title,
//       created_at: data.conversation.created_at,
//       app_id: data.conversation.app_id,
//       messages,
//     }
//   } catch (error) {
//     console.error('Error fetching shared conversation:', error)
//     return null
//   }
// }
