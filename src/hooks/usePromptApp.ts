import { useMemo } from 'react'
import usePromptApps from '@/hooks/usePromptApps'

// It can take a string or number because the db has both :')
export const usePromptApp = (promptAppId?: string | number | null) => {
  const { prompts } = usePromptApps(false)
  return useMemo(() => {
    if (!promptAppId) {
      return undefined
    }
    // @ts-ignore
    return prompts.find((p) => p.id == promptAppId)
  }, [prompts, promptAppId])
}
