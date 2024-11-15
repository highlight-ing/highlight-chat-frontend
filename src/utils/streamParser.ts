import { Toast } from '@/types'

import { UseIntegrationsAPI } from '@/features/integrations/_hooks/use-integrations'
import { integrationFunctionNames } from '@/features/integrations/utils'

type StreamParserProps = {
  showConfirmationModal: (message: string) => Promise<boolean>
  addToast: (toast: Partial<Toast>) => void
  integrations: UseIntegrationsAPI
  conversationId: string
}

export async function parseAndHandleStreamChunk(
  chunk: string,
  { showConfirmationModal, addToast, integrations, conversationId }: StreamParserProps,
) {
  let contextConfirmed: boolean | null = null
  let accumulatedContent = ''
  let factIndex = null
  let fact = null
  let messageId = null

  // Split the chunk into individual data objects
  const dataObjects = chunk.split(/\n(?=data: )/)

  for (const dataStr of dataObjects) {
    if (!dataStr.trim()) continue // Skip empty strings

    // Remove the 'data: ' prefix if it exists
    const jsonStr = dataStr.replace(/^data: /, '').trim()

    try {
      // Try to parse as JSON
      const jsonChunk = JSON.parse(jsonStr)
      console.log('got a chunk', jsonChunk)

      switch (jsonChunk.type) {
        case 'text':
          accumulatedContent += jsonChunk.content
          messageId = jsonChunk.message_id
          break

        case 'loading':
          if (jsonChunk.name === 'highlight_search') {
            integrations.showLoading(conversationId, jsonChunk.name, jsonChunk.loaded)
          }
          // } else if (integrationFunctionNames.includes(jsonChunk.name) && jsonChunk.loaded === false) {
          //   integrations.showLoading(conversationId, jsonChunk.name)
          // }
          break

        // We can define each tool use with different names
        case 'tool_use':
          if (jsonChunk.name === 'get_more_context_from_window' || jsonChunk.name === 'get_more_context') {
            if (contextConfirmed === null) {
              contextConfirmed = await showConfirmationModal(
                'The assistant is requesting additional context. Do you want to allow this?',
              )
            }
            if (contextConfirmed) {
              const window = jsonChunk.input.window
              if (window) {
                return {
                  content: accumulatedContent,
                  windowName: window,
                  conversation: null,
                  factIndex: null,
                  fact: null,
                  messageId: messageId,
                }
              }
            }
          }
          if (jsonChunk.name === 'create_linear_ticket') {
            const title = jsonChunk.input.title ?? ''
            const description = jsonChunk.input.description ?? ''

            integrations.createLinearTicket(conversationId, title, description)
          }
          if (jsonChunk.name === 'create_notion_page') {
            const title = jsonChunk.input.title ?? ''
            const description = jsonChunk.input.description ?? undefined
            const content = jsonChunk.input.content ?? ''

            integrations.createNotionPage(conversationId, { title, description, content })
          }

          if (jsonChunk.name === 'create_google_calendar_event') {
            const summary = jsonChunk.input.summary ?? ''
            const location = jsonChunk.input.location ?? undefined
            const description = jsonChunk.input.description ?? undefined
            const start = jsonChunk.input.start ?? undefined
            const end = jsonChunk.input.end ?? undefined

            integrations.createGoogleCalendarEvent(conversationId, { summary, location, description, start, end })
          }

          if (jsonChunk.name === 'get_more_context_from_conversations') {
            if (contextConfirmed === null) {
              contextConfirmed = await showConfirmationModal(
                'The assistant is requesting additional context. Do you want to allow this?',
              )
            }
            if (contextConfirmed) {
              const conversation = jsonChunk.input.conversation
              if (conversation) {
                return {
                  content: accumulatedContent,
                  windowName: null,
                  conversation: conversation,
                  factIndex: null,
                  fact: null,
                  messageId: messageId,
                }
              }
            }
          }
          if (jsonChunk.name === 'add_or_update_about_me_facts') {
            // This will update the fact at the specified index
            if (typeof jsonChunk.input.fact_index === 'number' && jsonChunk.input.fact) {
              factIndex = jsonChunk.input.fact_index
              fact = jsonChunk.input.fact
              return {
                content: accumulatedContent,
                windowName: null,
                conversation: null,
                factIndex: factIndex,
                fact: fact,
                messageId: messageId,
              }
            }
            // This will add the fact to the end of the array
            else if (jsonChunk.input.fact) {
              fact = jsonChunk.input.fact
              return {
                content: accumulatedContent,
                windowName: null,
                conversation: null,
                factIndex: null,
                fact: fact,
                messageId: messageId,
              }
            }
          }
          break

        case 'done':
          // Message is complete, return the accumulated content and attachments added
          return {
            content: accumulatedContent,
            windowName: null,
            conversation: null,
            factIndex: null,
            fact: null,
            messageId: messageId,
          }

        case 'message_delta':
          // Handle message delta if needed
          break

        case 'error':
          console.error('Error from backend:', jsonChunk.content)
          addToast({
            title: 'Unexpected Server Error',
            description: jsonChunk.content,
            type: 'error',
            timeout: 15000,
          })
          break

        default:
          console.warn('Unknown chunk type:', jsonChunk.type)
      }
    } catch (parseError) {
      // If parsing fails, log the error but don't add the content
      addToast({
        title: 'Unexpected Parse Error',
        description: 'Error parsing incoming response from the server.',
        type: 'error',
        timeout: 15000,
      })
      console.error('Error parsing JSON:', parseError, 'Raw data:', jsonStr)
    }
  }

  // If we haven't returned yet, return the accumulated content and attachments added
  return {
    content: accumulatedContent,
    windowName: null,
    conversation: null,
    factIndex: null,
    fact: null,
    messageId: messageId,
  }
}
