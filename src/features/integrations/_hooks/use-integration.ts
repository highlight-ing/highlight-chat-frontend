import { Message } from '@/types'
import Highlight from '@highlight-ai/app-runtime'
import { v4 as uuidv4 } from 'uuid'

import { useStore } from '@/components/providers/store-provider'

import { useIntegrations } from './use-integrations'

export function useIntegration() {
  const { createNotionPage, createLinearTicket } = useIntegrations()
  const addConversationMessage = useStore((state) => state.addConversationMessage)

  async function createAction(action: 'notion' | 'linear', message: Message) {
    const content = message.content as string

    addConversationMessage(message.conversation_id, {
      id: uuidv4(),
      conversation_id: message.conversation_id,
      content: 'Creating Notion page...',
      role: 'assistant',
    })

    let createLang = 'Generate a title for '

    if (action === 'notion') {
      createLang += "this Notion page using the user's text."
    } else if (action === 'linear') {
      createLang += "this Linear ticket using the user's text."
    }

    const generator = Highlight.inference.getTextPrediction([
      { role: 'system', content: createLang },
      { role: 'user', content },
    ])

    let title = ''
    for await (const chunk of generator) {
      title += chunk
    }

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
