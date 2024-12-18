'use client'

import { PinnedPrompt } from '@/types'

import usePromptApps from '@/hooks/usePromptApps'

export function useUniquePinnedPrompts() {
  const { isPinnedPromptsLoading, pinnedPrompts } = usePromptApps()

  const uniquePrompts = pinnedPrompts.reduce((acc: Array<PinnedPrompt>, curr) => {
    const externalIds = acc.map((prompt) => prompt.external_id)
    if (!externalIds.includes(curr.external_id)) acc.push(curr)
    else console.log('Duplicate prompt found:', curr.external_id)

    return acc
  }, [])

  return { isPinnedPromptsLoading, uniquePrompts }
}
