'use client'

import HighlightChat from './HighlightChat'
import usePromptApps from '@/hooks/usePromptApps'
import { Prompt } from '@/types/supabase-helpers'
import { useEffect } from 'react'

export default function PromptHelper({ prompt }: { prompt: Prompt }) {
  const { selectPrompt } = usePromptApps()

  useEffect(() => {
    selectPrompt(prompt)
  }, [prompt])

  return <HighlightChat />
}
