'use client'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { ConversationData } from '@/types/conversations'

export const feedHiddenAtom = atomWithStorage('hideHomeFeed', false)

export const toggleFeedVisibilityAtom = atom(null, (_, set) => set(feedHiddenAtom, (previousValue) => !previousValue))

export const recentActionsPageAtom = atom(0)

export const currentListIndexAtom = atom(0)

export const multiSelectedAudioNoteIdsAtom = atom<Array<ConversationData['id']>>([])

export const isMountedAtom = atom(false)
