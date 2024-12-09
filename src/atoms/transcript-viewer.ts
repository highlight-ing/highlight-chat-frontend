'use client'

import { atom } from 'jotai'

import { ConversationData } from '@/types/conversations'

export const transcriptOpenAtom = atom(false)

export const selectedAudioNoteAtom = atom<Partial<ConversationData> | null>(null)

export const isOnHomeAtom = atom(false)
