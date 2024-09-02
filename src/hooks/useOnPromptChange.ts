import { useStore } from '@/providers/store-provider'
import { useEffect } from 'react'
import usePromptApps from '@/hooks/usePromptApps'

export const useOnPromptChange = () => {
  const { pinnedPrompts } = usePromptApps()
  const promptApp = useStore((state) => state.promptApp)
  const openModal = useStore((state) => state.openModal)
  const closeModal = useStore((state) => state.closeModal)

  useEffect(() => {
    if (!promptApp) {
      closeModal('prompt-added')
      return
    }
    console.log(promptApp.slug, pinnedPrompts)
    if (pinnedPrompts.some((p) => p.slug === promptApp.slug)) {
      openModal('prompt-added', { prompt: promptApp })
    }
  }, [promptApp, pinnedPrompts])
}
