import { useEffect, useState } from 'react'

import { useApi } from '@/hooks/useApi'

export const useImageDownload = (imageId: string | null, conversationId?: string) => {
  const { getImageByFileId } = useApi()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchImage = async () => {
      if (!imageId) {
        setImageUrl(null)
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        let url = ''
        if (conversationId) {
          url = await getImageByFileId(imageId, conversationId, { version: 'v4' })
        }

        if (isMounted) {
          setImageUrl(url)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch image'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchImage()

    return () => {
      isMounted = false
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [conversationId])

  return { imageUrl, isLoading, error }
}
