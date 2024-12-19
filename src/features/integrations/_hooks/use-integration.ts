import { Message } from '@/types'
import Highlight from '@highlight-ai/app-runtime'
import { v4 as uuidv4 } from 'uuid'

import { HIGHLIGHT_BACKEND_BASE_URL } from '@/lib/integrations-backend'
import { useStore } from '@/components/providers/store-provider'

import { useHighlightToken } from './use-hl-token'
import { useIntegrations } from './use-integrations'

export function useIntegration() {
  const { createNotionPage, createLinearTicket } = useIntegrations()
  const addConversationMessage = useStore((state) => state.addConversationMessage)
  const { data: hlToken } = useHighlightToken()

  async function createAction(action: 'notion' | 'linear', message: Message) {
    const content = message.content as string

    addConversationMessage(message.conversation_id, {
      id: uuidv4(),
      conversation_id: message.conversation_id,
      content: 'Creating Notion page...',
      role: 'assistant',
      given_feedback: null,
    })

    const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/ai/summarize/title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${hlToken}`,
      },
      body: content,
    })

    const title = await response.text()

    switch (action) {
      case 'notion':
        createNotionPage(
          message.conversation_id,
          {
            title,
            content,
            description: '',
          },
          false,
        )
        break
      case 'linear':
        createLinearTicket(message.conversation_id, title, content, false)
        break
    }
  }

  return {
    createAction,
  }
}
