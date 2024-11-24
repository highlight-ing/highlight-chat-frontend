import { ConversationData } from '@highlight-ai/app-runtime'
import { atom } from 'jotai'

export const transcriptOpenAtom = atom(false)

export const selectedAudioNoteAtom = atom<Partial<ConversationData> | null>(null)

export const isOnHomeAtom = atom(false)
