import { useApi } from '@/hooks/useApi'
import { useState, useRef } from 'react'

//MARK: - Need to put actual url in Vercel env variables
const SHARE_CONVERSATION_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

export const useShareConversation = () => {
  const { post } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController>()

  const getShareLink = async (conversationId: string): Promise<string> => {
    setIsLoading(true)
    setError(null)

    // Create a new AbortController for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const formData = new FormData()
      formData.append('conversation_id', conversationId)
      const response = await post('share-link/create', formData, {
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      return `https://chat.hl.ing/share/${data.shared_conversation_id}`
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Share conversation request was aborted')
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      }
      throw err
    } finally {
      setIsLoading(false)
      abortControllerRef.current = undefined
    }
  }

  const abortShareRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  return { getShareLink, isLoading, error, abortShareRequest }
}

export const useDeleteConversation = () => {
  const { deleteRequest } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController>()

  const deleteSharedConversation = async (originalConversationId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    // Create a new AbortController for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const response = await deleteRequest(`share-link/${originalConversationId}`, {
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to delete shared conversation')
      }

      // Optional: You can handle the success message here if needed
      // const data = await response.json()
      // console.log(data.message)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Delete shared conversation request was aborted')
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      }
      throw err
    } finally {
      setIsLoading(false)
      abortControllerRef.current = undefined
    }
  }

  const abortDeleteRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  return { deleteSharedConversation, isLoading, error, abortDeleteRequest }
}
