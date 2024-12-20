'use client'

import { ChatHistoryItem } from '@/types'
import { atom } from 'jotai'

import { ConversationData } from '@/types/conversations'

type SidePanelContent = 'audio-note' | 'chat'
type SelectedAudioNote = Partial<ConversationData> | null
type SelectedChat = Partial<ChatHistoryItem> | null

export const sidePanelOpenAtom = atom(false)

export const sidePanelContentTypeAtom = atom<SidePanelContent | null>(null)

export const selectedAudioNoteAtom = atom(null as SelectedAudioNote, (_, set, value: SelectedAudioNote) => {
  set(selectedAudioNoteAtom, value)
  if (value) {
    set(sidePanelContentTypeAtom, 'audio-note')
  }
})

export const selectedChatAtom = atom(null as SelectedChat, (_, set, value: SelectedChat) => {
  set(selectedChatAtom, value)
  if (value) {
    set(sidePanelContentTypeAtom, 'chat')
  }
})

export const isOnHomeAtom = atom(false)
