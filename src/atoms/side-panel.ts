'use client'

import { ChatHistoryItem } from '@/types'
import { atom } from 'jotai'

import { ConversationData } from '@/types/conversations'

type SidePanelContent = 'audio-note' | 'chat'
type SelectedAudioNote = ConversationData | null
type SelectedChat = ChatHistoryItem

export const sidePanelOpenAtom = atom(false)

export const sidePanelContentTypeAtom = atom<SidePanelContent | null>(null)

export const selectedAudioNoteAtom = atom({} as SelectedAudioNote, (_, set, value: SelectedAudioNote) => {
  set(selectedAudioNoteAtom, value)
  if (value) {
    set(sidePanelContentTypeAtom, 'audio-note')
  }
})

export const selectedChatIdAtom = atom('' as string, (_, set, chatId: string) => {
  set(selectedChatIdAtom, chatId)
  if (chatId) {
    set(sidePanelContentTypeAtom, 'chat')
  }
})

export const isOnHomeAtom = atom(false)
