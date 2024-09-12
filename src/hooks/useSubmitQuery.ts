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
import { parseAndHandleStreamChunk } from '@/utils/streamParser'
import { trackEvent } from '@/utils/amplitude'
import * as Sentry from '@sentry/react'

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
  console.log('addAttachmentsToFormData')
  let screenshot, audio, fileTitle, clipboardText, ocrText, windowContext

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
        case 'window_context':
          windowContext = attachment.value
          formData.append('window_context', attachment.value)
          break
        default:
          console.warn('Unknown attachment type:', attachment.type)
      }
    }
  }

  return { screenshot, audio, fileTitle, clipboardText, ocrText, windowContext }
}

export const useSubmitQuery = () => {
  const { post } = useApi()

  const { addAttachment } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
    })),
  )

  const {
    getOrCreateConversationId,
    attachments,
    clearAttachments,
    setInputIsDisabled,
    aboutMe,
    addConversationMessage,
    updateLastConversationMessage,
    addToast,
  } = useStore(
    useShallow((state) => ({
      getOrCreateConversationId: state.getOrCreateConversationId,
      attachments: state.attachments,
      clearAttachments: state.clearAttachments,
      setInputIsDisabled: state.setInputIsDisabled,
      aboutMe: state.aboutMe,
      addConversationMessage: state.addConversationMessage,
      updateLastConversationMessage: state.updateLastConversationMessage,
      addToast: state.addToast,
    })),
  )

  const setInput = useStore((state) => state.setInput)

  const abortControllerRef = useRef<AbortController>()
  const { getAccessToken } = useAuth()
  const conversationId = useStore((state) => state.conversationId)
  const conversationIdRef = useRef(conversationId)

  const { openModal, closeModal } = useStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )

  const showConfirmationModal = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal('confirmation-modal', {
        header: 'Additional Context Requested',
        children: message,
        primaryAction: {
          label: 'Allow',
          onClick: () => {
            closeModal('confirmation-modal')
            resolve(true)
          },
          variant: 'primary',
        },
        secondaryAction: {
          label: 'Deny',
          onClick: () => {
            closeModal('confirmation-modal')
            resolve(false)
          },
          variant: 'ghost-neutral',
        },
      })
    })
  }

  const fetchResponse = async (conversationId: string, formData: FormData, token: string, isPromptApp: boolean) => {
    const transaction = Sentry.startTransaction({
      name: 'fetchResponse',
      op: 'function',
    })

    setInputIsDisabled(true)
    const startTime = Date.now()

    try {
      formData.append('conversation_id', conversationId)

      const endpoint = isPromptApp ? 'chat/prompt-as-app' : 'chat/'

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const checkAbortSignal = () => {
        if (abortController.signal.aborted) {
          throw new Error('Chat message request aborted')
        }
      }

      const response = await Sentry.startSpan({ name: 'API Request', op: 'http' }, async (span) => {
        const res = await post(endpoint, formData, { version: 'v3' })
        span.setData('endpoint', endpoint)
        span.setData('status', res.status)
        return res
      })
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      checkAbortSignal()

      addConversationMessage(conversationId!, { role: 'assistant', content: '' })

      let accumulatedMessage = ''

      while (!abortController.signal.aborted) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)

        checkAbortSignal()

        const newContent = await parseAndHandleStreamChunk(chunk, {
          formData,
          addAttachment,
          showConfirmationModal,
          addToast,
          handleSubmit,
        })

        if (newContent) {
          accumulatedMessage += newContent
          updateLastConversationMessage(conversationId, {
            role: 'assistant',
            content: accumulatedMessage,
          })
        }
      }
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      // @ts-ignore
      console.error('Error fetching response:', error.stack ?? error.message)

      // @ts-ignore
      if (error.message.includes('aborted')) {
        console.log('Skipping message request, aborted')
      } else {
        // Log to Sentry
        Sentry.captureException(error, {
          extra: {
            conversationId,
            isPromptApp,
            duration,
            endpoint: isPromptApp ? 'chat/prompt-as-app' : 'chat/',
          },
        })

        // Log to Amplitude
        trackEvent('HL_CHAT_BACKEND_API_ERROR', {
          endpoint: isPromptApp ? 'chat/prompt-as-app' : 'chat/',
          duration,
          // @ts-ignore
          errorMessage: error.message,
        })

        addToast({
          title: 'Unexpected Error',
          // @ts-ignore
          description: `${error?.message}`,
          type: 'error',
          timeout: 15000,
        })
      }
    } finally {
      const endTime = Date.now()
      const duration = endTime - startTime

      transaction.setData('duration', duration)
      transaction.setData('isPromptApp', isPromptApp)
      transaction.setData('endpoint', isPromptApp ? 'chat/prompt-as-app' : 'chat/')
      transaction.setData('success', !abortControllerRef.current?.signal.aborted)

      transaction.finish()

      // Log request to Amplitude
      trackEvent('HL_CHAT_BACKEND_API_REQUEST', {
        endpoint: isPromptApp ? 'chat/prompt-as-app' : 'chat/',
        duration,
        success: !abortControllerRef.current?.signal.aborted,
      })

      setInputIsDisabled(false)
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

    if (!context.application) {
      console.log('No application data in context, ignoring.')
      return
    }

    let query = context.suggestion || ''
    let screenshotUrl = context.attachments?.find((a) => a.type === 'screenshot')?.value
    let clipboardText = context.attachments?.find((a) => a.type === 'clipboard')?.value
    let audio = context.attachments?.find((a) => a.type === 'audio')?.value
    let windowTitle = context.application?.focusedWindow?.title
    // @ts-ignore
    let appIcon = context.application?.appIcon
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
      setInputIsDisabled(true)

      const att = context.attachments || ([] as unknown)
      const fileAttachments = (att as FileAttachment[]).filter((a) => a.type && fileAttachmentTypes.includes(a.type))

      const conversationId = getOrCreateConversationId()
      addConversationMessage(conversationId!, {
        role: 'user',
        content: query,
        clipboard_text: clipboardText,
        screenshot: screenshotUrl,
        audio,
        window: windowTitle ? { title: windowTitle, appIcon: appIcon, type: 'window' } : undefined,
        windows: windows,
        file_attachments: fileAttachments as unknown as FileAttachment[],
      })

      setInput('')
      clearAttachments()

      const formData = new FormData()
      formData.append('prompt', query)
      formData.append('windows', JSON.stringify(windows))

      if (promptApp) {
        formData.append('app_id', promptApp.external_id)
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

      const accessToken = await getAccessToken()
      await fetchResponse(conversationId, formData, accessToken, promptApp ? true : false)
    }
  }

  const handleSubmit = async (input: string, promptApp?: Prompt) => {
    const transaction = Sentry.startTransaction({
      name: 'handleSubmit',
      op: 'function',
    })

    try {
      console.log('handleSubmit triggered')
      const query = input.trim()

      if (!query) {
        console.log('No query provided, ignoring.')
        return
      }

      if (query) {
        setInputIsDisabled(true)

        const formData = new FormData()
        formData.append('prompt', query)

        const isPromptApp = promptApp ? true : false

        if (isPromptApp && promptApp!.external_id !== undefined) {
          formData.append('app_id', promptApp!.external_id)
        }

        // Fetch windows information
        await Sentry.startSpan({ name: 'fetchWindows', op: 'function' }, async () => {
          const windows = await fetchWindows()
          formData.append('windows', JSON.stringify(windows))
        })

        if (aboutMe) {
          formData.append('about_me', JSON.stringify(aboutMe))
        }

        const { screenshot, audio, fileTitle, clipboardText, ocrText, windowContext } = await Sentry.startSpan(
          { name: 'addAttachmentsToFormData', op: 'function' },
          async () => {
            return await addAttachmentsToFormData(formData, attachments)
          },
        )

        console.log('windowContext: ', windowContext)

        const conversationId = getOrCreateConversationId()
        addConversationMessage(conversationId!, {
          role: 'user',
          content: query,
          screenshot,
          ocr_text: ocrText,
          audio,
          file_title: fileTitle,
          clipboard_text: clipboardText,
          windows: await fetchWindows(), // Add windows information to the message
          window_context: windowContext,
          file_attachments: attachments.filter((attachment) => attachment.type === 'text_file'),
        })

        setInput('')
        clearAttachments()

        const accessToken = await getAccessToken()
        await fetchResponse(conversationId, formData, accessToken, isPromptApp)
      }
    } catch (error) {
      Sentry.captureException(error)
    } finally {
      transaction.finish()
    }
  }

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  return { handleSubmit, handleIncomingContext }
}
