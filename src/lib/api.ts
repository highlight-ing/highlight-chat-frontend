import { SharedChat } from '@/types'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/'

interface RequestOptions {
  version?: 'v1'
  signal?: AbortSignal
}

export const getSharedConversation = async (id: string, options?: RequestOptions): Promise<SharedChat | null> => {
  try {
    const response = await fetch(`${backendUrl}api/${options?.version ?? 'v1'}/share-link/${id}`, {
      method: 'GET',
      signal: options?.signal,
    })

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
