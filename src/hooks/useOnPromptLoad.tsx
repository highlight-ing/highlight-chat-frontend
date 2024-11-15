import { useEffect } from 'react'

import { useStore } from '@/components/providers/store-provider'

import { useCurrentChatMessages } from './useCurrentChatMessages'
import { useSubmitQuery } from './useSubmitQuery'

export function useOnPromptLoad() {
  const promptApp = useStore((state) => state.promptApp)
  const input = useStore((state) => state.inputOverride)
  const attachments = useStore((state) => state.attachments)
  const messages = useCurrentChatMessages()
  const { handleSubmit } = useSubmitQuery()

  useEffect(() => {
    const contextHasAttachments = attachments && attachments.length > 0
    const contextHasInput = input && input !== ''

    if (!contextHasAttachments && !contextHasInput) return

    if (contextHasAttachments && !contextHasInput) {
      handleSubmit(promptApp?.name ?? '', promptApp)
      return
    }

    if (promptApp && messages.length === 0) {
      handleSubmit(input ?? '', promptApp)
    }
  }, [promptApp, messages])
}
