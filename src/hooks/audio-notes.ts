import Highlight from '@highlight-ai/app-runtime'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'

import { ConversationData } from '@/types/conversations'
import { selectedAudioNoteAtom } from '@/atoms/side-panel'

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
      if (!audioNote?.id) {
        return
      }

      const foundConversation = await Highlight.conversations.getConversationById(audioNote.id)
      return foundConversation as ConversationData | undefined
    },
    staleTime: THIRTY_MINUTES_IN_MS,
    gcTime: 60000,
  })
}

export function useAudioNotesStore() {
  const queryClient = useQueryClient()
  const [selectedAudioNote, setSelectedAudioNote] = useAtom(selectedAudioNoteAtom)

  async function invalidateAudioNotes() {
    await queryClient.invalidateQueries({ queryKey: ['audio-notes'] })
  }

  async function updateAudioNote(audioNote: Partial<Omit<ConversationData, 'id'>> & { id: ConversationData['id'] }) {
    queryClient.setQueryData(['audio-notes'], (originalAudioNotes: Array<ConversationData>) => {
      const audioNotes = [...originalAudioNotes]
      const existingAudioNoteIndex = audioNotes.findIndex((note) => note.id === audioNote.id)
      const updatedAudioNote = { ...audioNotes[existingAudioNoteIndex], ...audioNote }

      audioNotes[existingAudioNoteIndex] = updatedAudioNote

      if (selectedAudioNote?.id === audioNote.id) {
        setSelectedAudioNote(updatedAudioNote)
      }

      return audioNotes
    })
  }

  return {
    invalidateAudioNotes,
    updateAudioNote,
  }
}
