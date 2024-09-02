import { useStore } from '@/providers/store-provider'
import { useEffect } from 'react'

export const useOnPromptChange = () => {
  const promptApp = useStore((state) => state.promptApp)
  const openModal = useStore((state) => state.openModal)
  const closeModal = useStore((state) => state.closeModal)

  useEffect(() => {
    if (!promptApp) {
      closeModal('prompt-added')
      return
    }
    openModal('prompt-added', { prompt: promptApp })
  }, [promptApp])
}
