import { useApi } from '@/hooks/useApi'
import { useState, useRef } from 'react'

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
      const response = await post('share-conversation/', formData, {
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      return `https://chat-new.highlight.ing/share/${data.share_id}`
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
