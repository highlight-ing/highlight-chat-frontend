'use client'

import { deleteAudioNoteShareLink, generateAudioNoteShareLink } from '@/actions/share-audio-note'
import { ChatHistoryItem } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy } from 'iconsax-react'
import { useSetAtom } from 'jotai'
import { toast } from 'sonner'

import { ConversationData } from '@/types/conversations'
import { trackEvent } from '@/utils/amplitude'
import { selectedAudioNoteAtom } from '@/atoms/side-panel'
import { useApi } from '@/hooks/useApi'
import { useStore } from '@/components/providers/store-provider'

import { useAudioNotesStore } from './audio-notes'
import { useChatHistoryStore } from './chat-history'
import useAuth from './useAuth'

export function useCopyChatShareLink() {
  return useMutation({
    mutationKey: ['copy-chat-share-link'],
    mutationFn: async (shareLink: string) => {
      await navigator.clipboard.writeText(`https://highlightai.com/share/${shareLink}`)
    },
    onSuccess: (_, shareLink) => {
      trackEvent('HL Chat Copy Link', {
        share_link: `https://highlightai.com/share/${shareLink}`,
      })
    },
  })
}

export function useGenerateChatShareLink() {
  const { post } = useApi()
  const setShareId = useStore((state) => state.setShareId)
  const { addOrUpdateChat } = useChatHistoryStore()

  return useMutation({
    mutationKey: ['generate-chat-share-link'],
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
        conversation_id: chat.id,
        share_link: `https://highlightai.com/share/${shareLink}`,
      })

      toast('Chat is now public. Link copied to clipboard.', { icon: <Copy variant="Bold" size={20} /> })
    },
    onError: (error, conversationId) => {
      console.error('Failed to copy link:', error)

      trackEvent('HL Chat Copy Link Error', { conversation_id: conversationId, error })

      toast.error('Could not copy link')
    },
  })
}

export function useDisableChatShareLink() {
  const { deleteRequest } = useApi()
  const setShareId = useStore((state) => state.setShareId)
  const { addOrUpdateChat } = useChatHistoryStore()

  return useMutation({
    mutationKey: ['disable-chat-share-link'],
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

      toast('Chat is now private. Share links disabled.')
    },
    onError: (error, chatId) => {
      console.error('Failed to disable link:', error)

      trackEvent('HL Chat Disable Link Error', { conversation_id: chatId, error: error })

      toast.error('Could disable share links')
    },
  })
}

export function useCopyAudioShareLink() {
  return useMutation({
    mutationKey: ['copy-audio-share-link'],
    mutationFn: async (shareLink: string) => {
      await navigator.clipboard.writeText(shareLink)
    },
    onSuccess: (_, shareLink) => {
      trackEvent('HL Chat Audio Note Copy Link', {
        share_link: shareLink,
      })
    },
  })
}

export function useGenerateAudioShareLink() {
  const { userId } = useAuth()
  const { updateAudioNote } = useAudioNotesStore()

  return useMutation({
    mutationKey: ['generate-chat-share-link'],
    mutationFn: async (audioNote: ConversationData) => {
      if (!audioNote || !userId) return

      const shareLink = await generateAudioNoteShareLink(audioNote, userId)

      await navigator.clipboard.writeText(shareLink)

      return shareLink as string
    },
    onSuccess: (shareLink, audioNote) => {
      if (!shareLink || !audioNote.id) return

      // queryClient.invalidateQueries({ queryKey: ['audio-notes'] })
      updateAudioNote({ id: audioNote.id, shareLink })

      trackEvent('HL Chat Audio Note Copy Link', {
        conversation_id: audioNote.id,
        share_link: shareLink,
      })

      toast('Audio note is now public. Link copied to clipboard.', {
        icon: <Copy variant="Bold" size={20} />,
        duration: 6000,
      })
    },
    onError: (error, audioNote) => {
      console.error('Failed to copy link:', error)

      trackEvent('HL Chat Audio Note Copy Link Error', { conversation_id: audioNote.id, error })

      toast.error('Could not copy link')
    },
  })
}

export function useDisableAudioShareLink() {
  const { updateAudioNote } = useAudioNotesStore()

  return useMutation({
    mutationKey: ['disable-audio-share-link'],
    mutationFn: async (audioNote: ConversationData) => {
      if (!audioNote) return

      const updatedAudioNote = await deleteAudioNoteShareLink(audioNote)

      return updatedAudioNote
    },
    onSuccess: (updatedAudioNote) => {
      if (!updatedAudioNote?.id) return

      updateAudioNote({ id: updatedAudioNote.id, shareLink: '' })

      trackEvent('HL Chat Audio Note Disable Link', { conversation_id: updatedAudioNote.id })

      toast('Audio note is now private. Share links disabled.', { duration: 6000 })
    },
    onError: (error, audioNote) => {
      console.error('Failed to disable link:', error)

      trackEvent('HL Chat Audio Note Disable Link Error', { conversation_id: audioNote, error: error })

      toast.error('Could disable share links')
    },
  })
}
