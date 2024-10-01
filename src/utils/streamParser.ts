import { Toast } from '@/types'
import { createLinearTicket } from './integrations'
import { UseIntegrationsAPI } from '@/hooks/useIntegrations'

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
  // Split the chunk into individual data objects
  const dataObjects = chunk.split(/\n(?=data: )/)

  for (const dataStr of dataObjects) {
    if (!dataStr.trim()) continue // Skip empty strings

    // Remove the 'data: ' prefix if it exists
    const jsonStr = dataStr.replace(/^data: /, '').trim()

    try {
      // Try to parse as JSON
      const jsonChunk = JSON.parse(jsonStr)

      switch (jsonChunk.type) {
        case 'text':
          accumulatedContent += jsonChunk.content
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
                }
              }
            }
          }
          if (jsonChunk.name === 'create_linear_ticket') {
            const title = jsonChunk.input.title

            console.log('streamParser create_linear_ticket', title)
            integrations.createLinearTicket(conversationId, title)
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
              }
            }
          }
          break

        case 'done':
          // Message is complete, return the accumulated content and attachments added
          return { content: accumulatedContent, windowName: null, conversation: null, factIndex: null, fact: null }

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
  return { content: accumulatedContent, windowName: null, conversation: null, factIndex: null, fact: null }
}
