'use client'

import { ChatHistoryItem } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { Copy } from 'iconsax-react'
import { toast } from 'sonner'

import { trackEvent } from '@/utils/amplitude'
import { useApi } from '@/hooks/useApi'
import { useStore } from '@/components/providers/store-provider'

import { useChatHistoryStore } from './chat-history'

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
  const setShareId = useStore((state) => state.setShareId)
  const { addOrUpdateChat } = useChatHistoryStore()

  return useMutation({
    mutationKey: ['generate-share-link'],
    mutationFn: async (conversation: ChatHistoryItem) => {
      if (!conversation.id) return

      const formData = new FormData()
      formData.append('conversation_id', conversation.id)

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
    onSuccess: (shareLink, chat) => {
      if (!shareLink || !chat.id) return

      //INFO: Updates the client side version of the conversation in zustand
      setShareId(chat.id, shareLink)

      addOrUpdateChat({
        id: chat.id,
        shared_conversations: [{ created_at: new Date().toISOString(), id: shareLink, title: chat.title }],
      })

      trackEvent('HL Chat Copy Link', {
        conversation_id: chat,
        share_link: `https://highlightai.com/share/${shareLink}`,
      })

      toast('Link copied to clipboard', { icon: <Copy variant="Bold" size={20} /> })
    },
    onError: (error, conversationId) => {
      console.error('Failed to copy link:', error)

      trackEvent('HL Chat Copy Link Error', { conversation_id: conversationId, error })

      toast.error('Could not copy link')
    },
  })
}

export function useDisableLink() {
  const { deleteRequest } = useApi()
  const addToast = useStore((state) => state.addToast)
  const setShareId = useStore((state) => state.setShareId)
  const { addOrUpdateChat } = useChatHistoryStore()

  return useMutation({
    mutationKey: ['disable-share-link'],
    mutationFn: async (conversationId: string | undefined) => {
      if (!conversationId) return

      const response = await deleteRequest(`share-link/${conversationId}`)

      if (!response.ok) {
        throw new Error('Failed to delete shared conversation')
      }
    },
    onSuccess: (_, chatId) => {
      if (!chatId) return

      setShareId(chatId, null)
      addOrUpdateChat({
        id: chatId,
        shared_conversations: [],
      })

      trackEvent('HL Chat Disable Link', { conversation_id: chatId })

      addToast({
        title: 'Share Link Disabled',
        description: 'All share links for this conversation have been disabled.',
        type: 'success',
        timeout: 4000,
      })

      toast('Link copied to clipboard')
    },
    onError: (error, chatId) => {
      console.error('Failed to disable link:', error)

      trackEvent('HL Chat Disable Link Error', { conversation_id: chatId, error: error })

      addToast({
        title: 'Failed to Disable Link',
        description: 'An error occurred while disabling the share link.',
        type: 'error',
      })
    },
  })
}
