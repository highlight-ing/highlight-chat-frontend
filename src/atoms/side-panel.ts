'use client'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { ConversationData } from '@/types/conversations'

type SidePanelContent = 'audio-note' | 'chat'
type SelectedAudioNote = Partial<ConversationData> | null

export const isOnHomeAtom = atom(false)

export const sidePanelOpenAtom = atom(false)

export const homeSidePanelOpenAtom = atomWithStorage('hl-side-panel-open', true)

export const showSidePanelAtom = atom(
  (get) => (get(isOnHomeAtom) && get(homeSidePanelOpenAtom)) || (!get(isOnHomeAtom) && get(sidePanelOpenAtom)),
)

export const toggleHomeSidePanelAtom = atom(null, (get, set) => {
  set(homeSidePanelOpenAtom, !get(homeSidePanelOpenAtom))
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
