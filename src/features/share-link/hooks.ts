'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/hooks/useApi'
import { trackEvent } from '@/utils/amplitude'
import { useStore } from '@/providers/store-provider'

export function useCopyLink() {
  return useMutation({
    mutationKey: ['copy-share-link'],
    mutationFn: async (shareLink: string) => {
      await navigator.clipboard.writeText(`https://highlightai.com/share/${shareLink}`)
    },
  })
}

export function useGenerateShareLink() {
  const { post } = useApi()
  const addToast = useStore((state) => state.addToast)
  const setShareId = useStore((state) => state.setShareId)

  return useMutation({
    mutationKey: ['generate-share-link'],
    mutationFn: async (conversationId: string | undefined) => {
      if (!conversationId) return

      console.log('Generating share link for: ', conversationId)

      const formData = new FormData()
      formData.append('conversation_id', conversationId)

      const response = await post('share-link/create', formData, {
        version: 'v4',
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      const shareLink = data.shared_conversation_id

      await navigator.clipboard.writeText(`https://highlightai.com/share/${shareLink}`)

      return shareLink as string
    },
    onSuccess: (data, conversationId) => {
      if (!data || !conversationId) return

      //INFO: Updates the client side version of the conversation in zustand
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
    onError: (error, conversationId) => {
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

export function useDisableLink() {
  const { deleteRequest } = useApi()
  const addToast = useStore((state) => state.addToast)
  const setShareId = useStore((state) => state.setShareId)

  return useMutation({
    mutationKey: ['disable-share-link'],
    mutationFn: async (conversationId: string | undefined) => {
      if (!conversationId) return

      console.log('Deleting share link for: ', conversationId)

      const response = await deleteRequest(`share-link/${conversationId}`)

      if (!response.ok) {
        throw new Error('Failed to delete shared conversation')
      }
    },
    onSuccess: (_, conversationId) => {
      if (!conversationId) return

      setShareId(conversationId, null)

      trackEvent('HL Chat Disable Link', { conversation_id: conversationId })

      addToast({
        title: 'Share Link Disabled',
        description: 'All share links for this conversation have been disabled.',
        type: 'success',
        timeout: 4000,
      })
    },
    onError: (error, conversationId) => {
      console.error('Failed to disable link:', error)

      trackEvent('HL Chat Disable Link Error', { conversation_id: conversationId, error: error })

      addToast({
        title: 'Failed to Disable Link',
        description: 'An error occurred while disabling the share link.',
        type: 'error',
      })
    },
  })
}
