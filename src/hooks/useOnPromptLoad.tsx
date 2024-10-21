import { useStore } from '@/providers/store-provider'
import { useEffect } from 'react'
import { useSubmitQuery } from './useSubmitQuery'
import { useCurrentChatMessages } from './useCurrentChatMessages'

export function useOnPromptLoad() {
  const promptApp = useStore((state) => state.promptApp)
  const input = useStore((state) => state.input)
  const messages = useCurrentChatMessages()
  const { handleSubmit } = useSubmitQuery()

  useEffect(() => {
    if (promptApp && messages.length === 0) {
      if (!input || (input.length === 0 && (promptApp?.description || promptApp?.name))) {
        handleSubmit(promptApp?.description ?? promptApp?.name)
      } else {
        handleSubmit(input)
      }
    }
  }, [promptApp, input, messages])
}
