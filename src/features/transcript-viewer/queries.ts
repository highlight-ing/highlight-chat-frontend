import Highlight from '@highlight-ai/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { selectedTranscriptIdAtom } from './atoms'

export function useTranscript() {
  const transcriptId = useAtomValue(selectedTranscriptIdAtom)

  return useQuery({
    queryKey: ['transcript', transcriptId],
    queryFn: async () => {
      const transcript = await Highlight.conversations.getConversationById(transcriptId)

      return transcript ?? { transcript: undefined }
    },
    enabled: !!transcriptId && transcriptId !== '',
  })
}
