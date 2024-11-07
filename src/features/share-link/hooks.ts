'use client'

import { useMutation } from '@tanstack/react-query'
import { useApi } from '@/hooks/useApi'
import { trackEvent } from '@/utils/amplitude'
import { useStore } from '@/providers/store-provider'

export function useCopyLink(shareLink: string) {
  return useMutation({
    mutationKey: ['copy-share-link', shareLink],
    mutationFn: async () => {
      await navigator.clipboard.writeText(`https://highlightai.com/share/${shareLink}`)
    },
  })
}

export function useGenerateShareLink(conversationId: string | undefined) {
  const { post } = useApi()
  const addToast = useStore((state) => state.addToast)
  const setShareId = useStore((state) => state.setShareId)

  return useMutation({
    mutationKey: ['generate-share-link', conversationId],
    mutationFn: async () => {
      if (!conversationId) return

      console.log('Generating share link for: ', conversationId)

      const formData = new FormData()
      formData.append('conversation_id', conversationId)

      const response = await post('share-link/create', formData, {
        version: 'v3',
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      const shareLink = data.shared_conversation_id

      await navigator.clipboard.writeText(`https://highlightai.com/share/${shareLink}`)

      return shareLink as string
    },
    onSuccess: (data) => {
      if (!data || !conversationId) return

      setShareId(conversationId, data)

      trackEvent('HL Chat Copy Link', {
        conversation_id: conversationId,
        share_link: `https://highlightai.com/share/${data}`,
      })

      addToast({
        title: 'Snapshot shared and copied to your clipboard',
        description: `https://highlightai.com/share/${data}`,
        type: 'success',
        timeout: 4000,
      })
    },
    onError: (error) => {
      console.error('Failed to copy link:', error)

      trackEvent('HL Chat Copy Link Error', { conversation_id: conversationId, error })

      addToast({
        title: 'Failed to Copy Link',
        description: 'An error occurred while generating the share link.',
        type: 'error',
      })
    },
  })
}
