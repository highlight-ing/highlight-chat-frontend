'use client'

import { ChatHistoryItem } from '@/types'
import { atom } from 'jotai'

import { ConversationData } from '@/types/conversations'

export const sidePanelOpenAtom = atom(false)

export const sidePanelContentTypeAtom = atom((get) => {
  if (get(selectedChatAtom)) {
    return 'chat'
  } else if (get(selectedAudioNoteAtom)) {
    return 'audio-note'
  }
})
export const selectedAudioNoteAtom = atom<Partial<ConversationData> | null>(null)
export const selectedChatAtom = atom<Partial<ChatHistoryItem> | null>(null)

export const isOnHomeAtom = atom(false)
