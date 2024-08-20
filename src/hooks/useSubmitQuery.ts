import { type HighlightContext } from '@highlight-ai/app-runtime'
import Highlight from '@highlight-ai/app-runtime'
import imageCompression from 'browser-image-compression'
import { useStore } from '@/providers/store-provider'
import useAuth from './useAuth'
import { useApi } from '@/hooks/useApi'
import { Prompt } from '@/types/supabase-helpers'
import { FileAttachment, FileAttachmentType, TextFileAttachment } from '@/types'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useRef } from 'react'

async function compressImageIfNeeded(file: File): Promise<File> {
  const ONE_MB = 1 * 1024 * 1024 // 1MB in bytes
  if (file.size <= ONE_MB) {
    return file
  }

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }

  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error('Error compressing image:', error)
    return file
  }
}

async function fetchWindows() {
  const windows = await Highlight.user.getWindows()
  return windows.map((window) => window.windowTitle)
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// TODO: Consolidate the two attachment types
// Should just remove the HLC-specific code and use the Highlight API
export default async function addAttachmentsToFormData(formData: FormData, attachments: any[]) {
  let screenshot, audio, fileTitle, clipboardText, ocrText

  for (const attachment of attachments) {
    if (attachment?.value) {
      switch (attachment.type) {
        case 'text_file':
          formData.append('text_file', attachment.fileName + '\n' + attachment.value)
          break
        case 'image':
        case 'screenshot':
          screenshot = attachment.value
          if (attachment.file) {
            const compressedFile = await compressImageIfNeeded(attachment.file)
            const base64data = await readFileAsBase64(compressedFile)
            const mimeType = compressedFile.type || 'image/png'
            const base64WithMimeType = `data:${mimeType};base64,${base64data.split(',')[1]}`
            formData.append('base64_image', base64WithMimeType)
          } else if (typeof attachment.value === 'string' && attachment.value.startsWith('data:image')) {
            formData.append('base64_image', attachment.value)
          } else {
            console.error('Unsupported image format:', attachment.value)
          }
          break
        case 'pdf':
          fileTitle = attachment.value.name
          formData.append('pdf', attachment.value)
          break
        case 'audio':
          audio = attachment.value
          formData.append('audio', attachment.value)
          break
        case 'spreadsheet':
          fileTitle = attachment.value.name
          formData.append('spreadsheet', attachment.value)
          break
        case 'clipboard':
          clipboardText = attachment.value
          formData.append('clipboard_text', attachment.value)
          break
        case 'ocr':
          ocrText = attachment.value
          formData.append('ocr_text', attachment.value)
          break
        default:
          console.warn('Unknown attachment type:', attachment.type)
      }
    }
  }

  return { screenshot, audio, fileTitle, clipboardText, ocrText }
}

const prepareHighlightContext = (highlightContext: any) => {
  if (!highlightContext) return ''

  const processedContext = { ...highlightContext }

  if (processedContext.attachments) {
    processedContext.attachments = processedContext.attachments.filter(
      (attachment: any) => attachment.type !== 'screenshot' && attachment.type !== 'audio',
    )
  }

  return JSON.stringify(processedContext)
}

export const useSubmitQuery = () => {
  const { post } = useApi()

  const {
    getOrCreateConversationId,
    attachments,
    clearAttachments,
    input,
    setInput,
    setIsDisabled,
    aboutMe,
    addConversationMessage,
    updateLastConversationMessage,
  } = useStore(
    useShallow((state) => ({
      getOrCreateConversationId: state.getOrCreateConversationId,
      attachments: state.attachments,
      clearAttachments: state.clearAttachments,
      input: state.input,
      setInput: state.setInput,
      setIsDisabled: state.setInputIsDisabled,
      aboutMe: state.aboutMe,
      addConversationMessage: state.addConversationMessage,
      updateLastConversationMessage: state.updateLastConversationMessage,
    })),
  )

  const abortControllerRef = useRef<AbortController>()
  const { getAccessToken } = useAuth()
  const conversationId = useStore((state) => state.conversationId)
  const conversationIdRef = useRef(conversationId)

  const fetchResponse = async (conversationId: string, formData: FormData, isPromptApp: boolean) => {
    setIsDisabled(true)

    try {
      formData.append('conversation_id', conversationId)

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const checkAbortSignal = () => {
        if (abortController.signal.aborted) {
          throw new Error('Chat message request aborted')
        }
      }

      const endpoint = isPromptApp ? 'chat/prompt-as-app' : 'chat_v2/'
      const response = await post(endpoint, formData)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      checkAbortSignal()

      let accumulatedResponse = ''
      addConversationMessage(conversationId!, { role: 'assistant', content: '' })

      while (!abortController.signal.aborted) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)

        // Split the chunk into individual JSON objects
        const jsonObjects = chunk.split(/(?<=})\s*(?=\{)/)

        for (const jsonStr of jsonObjects) {
          checkAbortSignal()

          try {
            const jsonChunk = JSON.parse(jsonStr)

            if (jsonChunk.type === 'text' && jsonChunk.content) {
              accumulatedResponse += jsonChunk.content
              updateLastConversationMessage(conversationId, {
                role: 'assistant',
                content: accumulatedResponse,
              })
            } else if (jsonChunk.type === 'error') {
              console.error('Error from backend:', jsonChunk.content)
              updateLastConversationMessage(conversationId, {
                role: 'assistant',
                content: 'Sorry, an error occurred: ' + jsonChunk.content,
              })
            }
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError)
            accumulatedResponse += jsonStr
            updateLastConversationMessage(conversationId!, {
              role: 'assistant',
              content: accumulatedResponse,
            })
          }
        }
      }
    } catch (error) {
      // @ts-ignore
      if (error.message.includes('aborted')) {
        console.log('Skipping message request, aborted')
      } else {
        // @ts-ignore
        console.error('Error fetching response:', error.stack ?? error.message)
        addConversationMessage(conversationId!, {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        })
      }
    } finally {
      setIsDisabled(false)
      abortControllerRef.current = undefined
    }
  }

  const handleIncomingContext = async (
    context: HighlightContext,
    navigateToNewChat: () => void,
    promptApp?: Prompt,
  ) => {
    console.log('Received context inside handleIncomingContext: ', context)
    console.log('Got attachment count: ', context.attachments?.length)
    context.attachments?.map((attachment) => {
      console.log('Attachment: ', JSON.stringify(attachment))
    })

    if (!context.suggestion || context.suggestion.trim() === '') {
      console.log('No context received, ignoring.')
      return
    }

    if (!context.application) {
      console.log('No application data in context, ignoring.')
      return
    }
    // Check if the context is empty, only contains empty suggestion and attachments, or has no application data
    if (!context.suggestion && (!context.attachments || context.attachments.length === 0)) {
      console.log('Empty or invalid context received, ignoring.')
      return
    }

    let query = context.suggestion || ''
    let screenshotUrl = context.attachments?.find((a) => a.type === 'screenshot')?.value
    let clipboardText = context.attachments?.find((a) => a.type === 'clipboard')?.value
    let audio = context.attachments?.find((a) => a.type === 'audio')?.value
    let windowTitle = context.application?.focusedWindow?.title
    let rawContents = context.application?.focusedWindow?.rawContents

    // Extract OCR content
    let ocrText = context.environment?.ocrScreenContents

    // Use rawContents if available, otherwise use ocrText
    let contentToUse = rawContents || ocrText

    const fileAttachmentTypes = ['pdf', 'spreadsheet', 'text_file', 'image']
    const hasFileAttachment = context.attachments?.some((a: { type: string }) => fileAttachmentTypes.includes(a.type))

    // Fetch windows information
    const windows = await fetchWindows()

    if (query || clipboardText || contentToUse || screenshotUrl || audio || hasFileAttachment) {
      const att = context.attachments || ([] as unknown)
      const fileAttachments = (att as FileAttachment[]).filter((a) => a.type && fileAttachmentTypes.includes(a.type))

      const conversationId = getOrCreateConversationId()
      addConversationMessage(conversationId!, {
        role: 'user',
        content: query,
        clipboard_text: clipboardText,
        screenshot: screenshotUrl,
        audio,
        window: windowTitle ? { title: windowTitle, type: 'window' } : undefined,
        windows: windows,
        file_attachments: fileAttachments,
      })

      setInput('')
      clearAttachments()

      const formData = new FormData()
      formData.append('prompt', query)
      formData.append('windows', JSON.stringify(windows))

      if (promptApp) {
        formData.append('app_id', promptApp.id.toString())
      }

      if (aboutMe) {
        formData.append('about_me', JSON.stringify(aboutMe))
      }

      const contextAttachments = context.attachments || []
      await addAttachmentsToFormData(formData, contextAttachments)

      // Add OCR text or raw contents to form data
      if (contentToUse) {
        formData.append('ocr_text', contentToUse)
      }

      await fetchResponse(conversationId, formData, !!promptApp)
    }
  }

  const handleSubmit = async (promptApp?: Prompt) => {
    const query = input.trim()

    if (!query) {
      console.log('No query provided, ignoring.')
      return
    }

    if (query) {
      const formData = new FormData()
      formData.append('prompt', query)

      const isPromptApp = !!promptApp
      if (isPromptApp) {
        formData.append('app_id', promptApp!.id.toString())
      }

      // Fetch windows information
      const windows = await fetchWindows()
      formData.append('windows', JSON.stringify(windows))
      // formData.append("llm_provider", "openai")

      // Add about_me to form data
      if (aboutMe) {
        formData.append('about_me', JSON.stringify(aboutMe))
      }

      const { screenshot, audio, fileTitle, clipboardText, ocrText } = await addAttachmentsToFormData(
        formData,
        attachments,
      )

      const conversationId = getOrCreateConversationId()
      addConversationMessage(conversationId!, {
        role: 'user',
        content: query,
        screenshot,
        audio,
        file_title: fileTitle,
        clipboard_text: clipboardText,
        windows: windows, // Add windows information to the message
      })

      setInput('')
      clearAttachments() // Clear the attachment immediately

      await fetchResponse(conversationId, formData, isPromptApp)
    }
  }

  useEffect(() => {
    // console.log('conversationIdRef:', conversationIdRef.current)
    // console.log('conversationId', conversationId)
    // console.log('abortControllerRef', typeof abortControllerRef.current)
    // if (conversationIdRef.current && conversationIdRef.current !== conversationId && abortControllerRef.current) {
    //   console.log("Aborting previous chat's message stream")
    //   abortControllerRef.current.abort('Aborted, conversation ID changed, stop streaming messages')
    // }
    conversationIdRef.current = conversationId
  }, [conversationId])

  return { handleSubmit, handleIncomingContext }
}
