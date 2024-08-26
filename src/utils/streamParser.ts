import Highlight from '@highlight-ai/app-runtime'
import { FileAttachment, Toast } from '@/types'

type StreamParserProps = {
  formData: FormData
  addAttachment: (attachment: FileAttachment) => void
  showConfirmationModal: (message: string) => Promise<boolean>
  addToast: (toast: Partial<Toast>) => void
}

export async function parseAndHandleStreamChunk(
  chunk: string,
  { formData, addAttachment, showConfirmationModal, addToast }: StreamParserProps,
) {
  let contextConfirmed: boolean | null = null
  let newContent = ''

  const jsonObjects = chunk.split(/(?<=})\s*(?=\{)/)
  for (const jsonStr of jsonObjects) {
    try {
      const jsonChunk = JSON.parse(jsonStr)

      switch (jsonChunk.type) {
        case 'text':
          newContent += jsonChunk.content
          break

        case 'tool_use':
          if (contextConfirmed === null) {
            contextConfirmed = await showConfirmationModal(
              'The assistant is requesting additional context. Do you want to allow this?',
            )
          }
          if (contextConfirmed && jsonChunk.input && jsonChunk.input.window) {
            await handleWindowContext(jsonChunk.input.window, formData, addAttachment)
          }
          break

        case 'done':
          // Message is complete we might add something here in the future
          break

        case 'tool_use_input':
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
      console.error('Error parsing JSON:', parseError)
      // Don't add unparseable content to newContent
    }
  }

  return newContent
}

async function handleWindowContext(
  window: string,
  formData: FormData,
  addAttachment: (attachment: FileAttachment) => void,
) {
  const screenshot = await Highlight.user.getWindowScreenshot(window)
  addAttachment({
    type: 'image',
    value: screenshot,
  })
  const granted = await Highlight.permissions.requestWindowContextPermission()
  if (granted) {
    const windowContext = await Highlight.user.getWindowContext(window)
    const ocrScreenContents = windowContext.environment.ocrScreenContents || ''
    addAttachment({
      type: 'window_context',
      value: ocrScreenContents,
    })
    formData.append('window_context', ocrScreenContents)
  }
}
