import Highlight from '@highlight-ai/app-runtime'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash } from 'iconsax-react'
import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'

import { ConversationData } from '@/types/conversations'
import { homeSidePanelOpenAtom, selectedAudioNoteAtom } from '@/atoms/side-panel'

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000

export function useAudioNotes() {
  return useQuery({
    queryKey: ['audio-notes'],
    queryFn: async () => {
      const recentConversations = await Highlight.conversations.getAllConversations()
      return recentConversations as Array<ConversationData> | undefined
    },
    staleTime: THIRTY_MINUTES_IN_MS,
  })
}

export function useAudioNoteById(audioNote: ConversationData) {
  return useQuery({
    queryKey: ['audio-notes', audioNote.id],
    queryFn: async () => {
      if (!audioNote?.id) return

      const foundConversation = await Highlight.conversations.getConversationById(audioNote.id)
      return foundConversation as ConversationData | undefined
    },
    staleTime: THIRTY_MINUTES_IN_MS,
    gcTime: 60000,
  })
}

export function useDeleteAudioNote() {
  const queryClient = useQueryClient()
  const [selectedAudioNote, setSelectedAudioNote] = useAtom(selectedAudioNoteAtom)
  const setHomeSidePanelOpen = useSetAtom(homeSidePanelOpenAtom)

  return useMutation({
    mutationKey: ['delete-audio-note'],
    mutationFn: async (audioNoteId: ConversationData['id']) => {
      if (!audioNoteId) return

      await Highlight.conversations.deleteConversation(audioNoteId)

      return audioNoteId
    },
    onSuccess: (audioNoteId) => {
      queryClient.invalidateQueries({ queryKey: ['audio-notes'] })

      if (selectedAudioNote?.id === audioNoteId) {
        setHomeSidePanelOpen(false)
        setSelectedAudioNote({})
      }

      toast('Deleted audio note', { icon: <Trash variant="Bold" size={20} /> })
      console.log('Deleted audio note:', audioNoteId)
    },
    onError: (audioNoteId) => {
      toast.error('Could not delete audio note', { icon: <Trash variant="Bold" size={20} /> })
      console.error('Failure to delete audio note:', audioNoteId)
    },
  })
}

export function useAudioNotesStore() {
  const queryClient = useQueryClient()
  const [selectedAudioNote, setSelectedAudioNote] = useAtom(selectedAudioNoteAtom)

  async function invalidateAudioNotes() {
    await queryClient.invalidateQueries({ queryKey: ['audio-notes'] })
  }

  function getAudioNotes() {
    return queryClient.getQueryData(['audio-notes']) as Array<ConversationData>
  }

  async function updateAudioNote(
    audioNoteUpdates: Partial<Omit<ConversationData, 'id'>> & { id: ConversationData['id'] },
  ) {
    const cachedAudioNotes = getAudioNotes()
    const currentAudioNote = cachedAudioNotes.find((audioNote) => audioNote.id === audioNoteUpdates.id)

    if (!currentAudioNote) return

    const updatedAudioNote = { ...currentAudioNote, ...audioNoteUpdates }

    if (selectedAudioNote?.id === audioNoteUpdates.id) {
      setSelectedAudioNote(updatedAudioNote)
    }

    try {
      await Highlight.conversations.updateConversation(updatedAudioNote)
      await invalidateAudioNotes()
      console.log('Conversation updated successfully:', updatedAudioNote.id)
    } catch (error) {
      console.error('Error updating conversation:', error)
    }
  }

  return {
    invalidateAudioNotes,
    updateAudioNote,
  }
}
