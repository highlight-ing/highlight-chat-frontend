import { useStore } from '@/providers/store-provider'
import { useEffect } from 'react'
import { useSubmitQuery } from './useSubmitQuery'
import { useCurrentChatMessages } from './useCurrentChatMessages'

export function useOnPromptLoad() {
  const promptApp = useStore((state) => state.promptApp)
  const input = useStore((state) => state.input)
  const attachments = useStore((state) => state.attachments)
  const messages = useCurrentChatMessages()
  const { handleSubmit } = useSubmitQuery()

  useEffect(() => {
    const noContextProvided = (!attachments || attachments.length === 0) && (!input || input === '')
    if (noContextProvided) return

    if (promptApp && messages.length === 0) {
      handleSubmit(input, promptApp)
    }
  }, [promptApp, messages])
}
