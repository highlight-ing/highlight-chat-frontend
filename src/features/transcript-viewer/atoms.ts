'use client'

import Highlight from '@highlight-ai/app-runtime'
import { atom } from 'jotai'

export const transcriptOpenAtom = atom(false)

export const selectedTranscriptIdAtom = atom('')

export const selectedTranscriptAtom = atom(async (get) => {
  const transcriptId = get(selectedTranscriptIdAtom)
  if (!transcriptId) return

  const transcript = await Highlight.conversations.getConversationById(transcriptId)

  return transcript
})
