'use client'

import Highlight from '@highlight-ai/app-runtime'
import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'

export const transcriptOpenAtom = atom(false)

export const selectedTranscriptIdAtom = atom<string | undefined>('')
export const selectedTranscriptAtom = atom(async (get) => {
  const transcriptId = get(selectedTranscriptIdAtom)
  if (!transcriptId) return

  const transcript = await Highlight.conversations.getConversationById(transcriptId)

  return transcript
})

export const selectedTranscriptQueryAtom = atomWithQuery((get) => ({
  queryKey: ['transcript', get(selectedTranscriptIdAtom)],
  queryFn: async () => {
    const transcriptId = get(selectedTranscriptIdAtom)
    if (!transcriptId) return

    const transcript = await Highlight.conversations.getConversationById(transcriptId)

    return transcript
  },
}))
