'use client'

import HighlightChat from './HighlightChat'
import usePromptApps from '@/hooks/usePromptApps'
import { usePromptStore } from '@/stores/prompt'
import { Prompt } from '@/types/supabase-helpers'
import { fetchPromptText } from '@/utils/prompts'
import { useEffect } from 'react'

export default function PromptHelper({ prompt }: { prompt: Prompt }) {
  const { setIsPromptApp, setPrompt } = usePromptStore()

  useEffect(() => {
    async function fetchPrompt() {
      // Fetch the prompt
      const text = await fetchPromptText(prompt.external_id)

      setPrompt({
        promptApp: prompt,
        promptName: prompt.name,
        promptDescription: prompt.description!,
        promptAppName: prompt.slug!,
        prompt: text,
      })

      setIsPromptApp(true)
    }

    fetchPrompt()
  }, [prompt])

  return <HighlightChat />
}
