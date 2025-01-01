'use client'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { ConversationData } from '@/types/conversations'

type SidePanelContent = 'audio-note' | 'chat'
type SelectedAudioNote = Partial<ConversationData> | null

export const sidePanelOpenAtom = atomWithStorage('hl-side-panel-open', true)

export const toggleSidePanelAtom = atom(null, (get, set) => {
  set(sidePanelOpenAtom, !get(sidePanelOpenAtom))
})

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

export const showBackButtonAtom = atom(false)

export const isOnHomeAtom = atom(false)
