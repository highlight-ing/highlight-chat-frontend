import { useStore } from '@/providers/store-provider'
import { useEffect } from 'react'
import usePromptApps from '@/hooks/usePromptApps'
import Highlight from '@highlight-ai/app-runtime'

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
    if (
      pinnedPrompts.some((p) => p.external_id === promptApp.external_id) &&
      !Highlight.appStorage.get(`ctas.promptAdded.${promptApp.external_id}`)
    ) {
      openModal('prompt-added', { prompt: promptApp })
      Highlight.appStorage.set(`ctas.promptAdded.${promptApp.external_id}`, true)
    }
  }, [promptApp, pinnedPrompts])
}
