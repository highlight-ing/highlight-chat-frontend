import { v4 as uuidv4 } from 'uuid'
import { ChatHistoryItem, SharedChat, UserMessage, SharedMessage } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:8080'

export async function fetchImageFromPublicEndpoint(imageUrl: string): Promise<Blob | null> {
  const imageEndpoint = `${API_BASE_URL}/api/v1/image/public`

  console.log('Fetching image from:', imageEndpoint)

  try {
    const response = await fetch(imageEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
    })

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText)
      const text = await response.text()
      console.error('Response body:', text)
      return null
    }

    return await response.blob()
  } catch (error) {
    console.error('Error in fetchImageFromPublicEndpoint:', error)
    return null
  }
}

export async function createShareLink(conversation: ChatHistoryItem): Promise<string> {
  const shareId = uuidv4()
  // TODO: Implement actual sharing logic with Supabase
  return `https://chat-new.highlight.ing/share/${shareId}`
}

export async function getSharedConversation(id: string): Promise<SharedChat | null> {
  try {
    const url = `${API_BASE_URL}/api/v1/share-link/${id}`
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
