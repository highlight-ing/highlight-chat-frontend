// src/hooks/useSubmitQuery.ts
import { useEffect, useRef } from 'react'
import { useStore } from '@/providers/store-provider'
import useAuth from './useAuth'
import { useApi } from '@/hooks/useApi'
import { Prompt } from '@/types/supabase-helpers'
import { useShallow } from 'zustand/react/shallow'
import { HighlightContext } from '@highlight-ai/app-runtime'
import Highlight from '@highlight-ai/app-runtime'
import * as Sentry from '@sentry/react'

import { addAttachmentsToFormData, fetchWindows } from '@/utils/attachmentUtils'
import { parseAndHandleStreamChunk } from '@/utils/streamParser'
import { buildFormData, FormDataInputs, AttachedContexts, AvailableContexts } from '@/utils/formDataUtils'
import { trackEvent } from '@/utils/amplitude'
import { processAttachments } from '@/utils/contextprocessor'
import { FileAttachment } from '@/types'
import { useUploadFile } from './useUploadFile'
import { v4 as uuidv4 } from 'uuid'
import { Attachment } from '@/types'

// Create a type guard for FileAttachment
function isFileAttachment(attachment: Attachment): attachment is FileAttachment {
  return ['pdf', 'image'].includes(attachment.type)
}

// Import necessary types from formDataUtils
import {
  TextFileAttachmentMetadata,
  FileAttachmentMetadata,
  ImageAttachmentMetadata,
  PDFAttachment,
  WindowContentsAttachment,
} from '@/utils/formDataUtils'

async function createAttachmentMetadata(
  attachment: FileAttachment,
  fileId: string,
): Promise<
  | TextFileAttachmentMetadata
  | FileAttachmentMetadata
  | ImageAttachmentMetadata
  | PDFAttachment
  | WindowContentsAttachment
> {
  switch (attachment.type) {
    case 'pdf':
      return {
        type: 'pdf',
        name: attachment.value.name,
        file_id: fileId,
      }
    case 'image':
      return {
        type: 'image',
        file_id: fileId,
      }
    case 'text_file':
      return {
        type: 'text_file',
        name: attachment.fileName || 'Unnamed text file',
        text: attachment.value,
        words: attachment.value.split(/\s+/).length,
        created_at: new Date(),
      }
    case 'spreadsheet':
      const text = await attachment.value.text()

      return {
        type: 'file_attachment',
        name: 'Spreadsheet',
        words: text.split(/\s+/).length,
        created_at: new Date(),
        file_type: 'spreadsheet',
      }
    case 'window_context':
      return {
        type: 'window_contents',
        text: attachment.value,
      }
    default:
      return {
        type: 'file_attachment',
        name: 'Unknown file',
        words: 0,
        created_at: new Date(),
        file_type: 'unknown',
      }
  }
}

// Add this helper function at the top of the file
function getFileType(attachment: FileAttachment): string {
  switch (attachment.type) {
    case 'pdf':
      return 'application/pdf'
    case 'image':
      return attachment.value?.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    case 'spreadsheet':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'text_file':
      return 'text/plain'
    default:
      return 'application/octet-stream'
  }
}

export const useSubmitQuery = () => {
  const { post } = useApi()
  const { getAccessToken } = useAuth()
  const { uploadFile } = useUploadFile()

  const {
    addAttachment,
    getOrCreateConversationId,
    attachments,
    clearAttachments,
    setInputIsDisabled,
    aboutMe,
    addConversationMessage,
    updateLastConversationMessage,
    addToast,
    updateLastMessageSentTimestamp,
    openModal,
    closeModal,
  } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
      getOrCreateConversationId: state.getOrCreateConversationId,
      attachments: state.attachments,
      clearAttachments: state.clearAttachments,
      setInputIsDisabled: state.setInputIsDisabled,
      aboutMe: state.aboutMe,
      addConversationMessage: state.addConversationMessage,
      updateLastConversationMessage: state.updateLastConversationMessage,
      addToast: state.addToast,
      updateLastMessageSentTimestamp: state.updateLastMessageSentTimestamp,
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )

  const setInput = useStore((state) => state.setInput)
  const conversationId = useStore((state) => state.conversationId)
  const conversationIdRef = useRef(conversationId)
  const abortControllerRef = useRef<AbortController>()

  // Centralized Error Handling
  const handleError = (error: any, context: any) => {
    console.error('Error:', error)
    Sentry.captureException(error, { extra: context })
    trackEvent('HL_CHAT_BACKEND_API_ERROR', {
      ...context,
      errorMessage: error.message,
    })
    addToast({
      title: 'Unexpected Error',
      description: `${error?.message}`,
      type: 'error',
      timeout: 15000,
    })
  }

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

  const checkAbortSignal = () => {
    if (abortControllerRef.current?.signal.aborted) {
      throw new Error('Chat message request aborted')
    }
  }

  const fetchResponse = async (
    conversationId: string,
    formData: FormData,
    isPromptApp: boolean,
    promptApp?: Prompt,
  ) => {
    setInputIsDisabled(true)
    const startTime = Date.now()

    try {
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const endpoint = isPromptApp ? 'chat/prompt-as-app' : 'chat/'

      const response = await post(endpoint, formData, { version: 'v4', signal: abortController.signal })
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      addConversationMessage(conversationId, { role: 'assistant', content: '' })

      let accumulatedMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        checkAbortSignal()

        const chunk = new TextDecoder().decode(value)

        const { content, windowName, conversation, factIndex, fact } = await parseAndHandleStreamChunk(chunk, {
          showConfirmationModal,
          addToast,
        })

        if (content) {
          accumulatedMessage += content
          updateLastConversationMessage(conversationId, {
            role: 'assistant',
            content: accumulatedMessage,
          })
        }

        if (conversation) {
          const conversation_data = await Highlight.conversations.getConversationById(conversation)
          if (conversation_data) {
            addAttachment({
              type: 'audio',
              value: conversation_data.transcript,
              duration: Math.floor(
                (new Date(conversation_data.endedAt).getTime() - new Date(conversation_data.startedAt).getTime()) /
                  60000,
              ),
            })
          } else {
            addToast({
              title: 'Failed to request Conversation',
              description: 'We were unable to request conversation with this ID',
            })
          }
        }
        console.log('incoming from parser factIndex: ', factIndex, 'fact: ', fact)
        if (typeof factIndex === 'number' && fact) {
          updateLastConversationMessage(conversationId, {
            role: 'assistant',
            content: accumulatedMessage,
            factIndex: factIndex,
            fact: fact,
          })
        } else if (fact) {
          updateLastConversationMessage(conversationId, {
            role: 'assistant',
            content: accumulatedMessage,
            fact: fact,
          })
        }

        if (windowName) {
          const contextGranted = await Highlight.permissions.requestWindowContextPermission()
          const screenshotGranted = await Highlight.permissions.requestScreenshotPermission()
          if (contextGranted && screenshotGranted) {
            addToast({
              title: 'Context Granted',
              description: `Context granted for ${windowName}`,
              type: 'success',
              timeout: 5000,
            })
            const screenshot = await Highlight.user.getWindowScreenshot(windowName)
            addAttachment({ type: 'image', value: screenshot })

            const windowContext = await Highlight.user.getWindowContext(windowName)
            const ocrScreenContents = windowContext.application.focusedWindow.rawContents
              ? windowContext.application.focusedWindow.rawContents
              : windowContext.environment.ocrScreenContents || ''
            addAttachment({ type: 'window_context', value: ocrScreenContents })

            await handleSubmit("Here's the context you requested.", promptApp, {
              image: screenshot,
              window_context: ocrScreenContents,
            })
          }
        }
      }
    } catch (error: any) {
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000

      if (error.message.includes('aborted')) {
        console.log('Skipping message request, aborted')
      } else {
        handleError(error, {
          conversationId,
          isPromptApp,
          duration,
          endpoint: isPromptApp ? 'chat/prompt-as-app' : 'chat/',
        })
      }
    } finally {
      const endTime = Date.now()
      const duration = endTime - startTime

      trackEvent('HL_CHAT_BACKEND_API_REQUEST', {
        endpoint: isPromptApp ? 'chat/prompt-as-app' : 'chat/',
        duration,
        success: !abortControllerRef.current?.signal.aborted,
      })

      setInputIsDisabled(false)
      abortControllerRef.current = undefined
    }
  }

  const handleIncomingContext = async (context: HighlightContext, promptApp?: Prompt) => {
    console.log('Received context:', context)

    if (!context.application) {
      console.log('No application data in context, ignoring.')
      return
    }

    const { suggestion: query = '', attachments: rawAttachments = [], application, environment } = context

    const screenshotUrl = rawAttachments.find((a) => a.type === 'screenshot')?.value
    const clipboardText = rawAttachments.find((a) => a.type === 'clipboard')?.value
    const audio = rawAttachments.find((a) => a.type === 'audio')?.value
    const windowTitle = application.focusedWindow?.title
    const appIcon = application.appIcon
    const rawContents = application.focusedWindow?.rawContents
    const ocrText = environment?.ocrScreenContents
    const contentToUse = rawContents || ocrText

    const processedAttachments = processAttachments(rawAttachments)
    const hasFileAttachment = processedAttachments.some((a) =>
      ['pdf', 'spreadsheet', 'text_file', 'image'].includes(a.type),
    )

    const windows = await fetchWindows()

    if (query || clipboardText || contentToUse || screenshotUrl || audio || hasFileAttachment) {
      setInputIsDisabled(true)

      const fileAttachments = attachments.filter(isFileAttachment)

      const conversationId = getOrCreateConversationId()
      addConversationMessage(conversationId, {
        role: 'user',
        content: query,
        clipboard_text: clipboardText,
        screenshot: screenshotUrl,
        audio,
        window: windowTitle ? { title: windowTitle, appIcon, type: 'window' } : undefined,
        windows,
        file_attachments: fileAttachments as unknown as FileAttachment[],
      })

      setInput('')
      // This will refresh the 'about me'
      updateLastMessageSentTimestamp()
      clearAttachments()

      // Extract and format attached_context_metadata
      const attachedContext: AttachedContexts = {
        context: [],
      }

      const availableContexts: AvailableContexts = {
        context: [],
      }

      // Upload files first
      const uploadedFiles = await Promise.all(
        fileAttachments.map(async (attachment) => {
          const fileName = `${uuidv4()}.${attachment.type}`
          const mimeType = getFileType(attachment)
          const uploadedFile = await uploadFile(
            new File([attachment.value], fileName, { type: mimeType }),
            conversationId,
          )
          return {
            originalAttachment: attachment,
            uploadedFile: uploadedFile,
          }
        }),
      )

      // Create a map of original attachments to file IDs
      const attachmentToFileIdMap = new Map(
        uploadedFiles.map(({ originalAttachment, uploadedFile }) => [originalAttachment, uploadedFile.file_id]),
      )

      // Now you can use this map to get the file ID for any file attachment
      fileAttachments.forEach(async (attachment) => {
        const fileId = attachmentToFileIdMap.get(attachment)
        if (fileId) {
          const metadata = await createAttachmentMetadata(attachment, fileId)
          attachedContext.context.push(metadata)
        }
      })

      // Build FormData using the updated builder
      const formData = await buildFormData({
        prompt: query,
        conversationId,
        llmProvider: 'anthropic',
        attachedContext,
        availableContexts,
      })

      const accessToken = await getAccessToken()
      await fetchResponse(conversationId, formData, !!promptApp, promptApp)
    }
  }

  const handleSubmit = async (
    input: string,
    promptApp?: Prompt,
    context?: { image?: string; window_context?: string },
  ) => {
    console.log('handleSubmit triggered')

    const query = input.trim()

    if (!query) {
      console.log('No query provided, ignoring.')
      return
    }

    try {
      setInputIsDisabled(true)

      const conversationId = getOrCreateConversationId()

      // Upload files first
      const uploadedFiles = await Promise.all(
        attachments.filter(isFileAttachment).map(async (attachment) => {
          const fileName = `${uuidv4()}.${attachment.type}`
          const mimeType = getFileType(attachment)
          const uploadedFile = await uploadFile(
            new File([attachment.value], fileName, { type: mimeType }),
            conversationId,
          )
          return {
            originalAttachment: attachment,
            uploadedFile: uploadedFile,
          }
        }),
      )

      // Extract and format attached_context_metadata
      const attachedContext: AttachedContexts = {
        context: [],
      }

      const availableContexts: AvailableContexts = {
        context: [],
      }

      // Create a map of original attachments to file IDs
      const attachmentToFileIdMap = new Map(
        uploadedFiles.map(({ originalAttachment, uploadedFile }) => [originalAttachment, uploadedFile.file_id]),
      )

      // Now you can use this map to get the file ID for any file attachment
      const fileAttachments = attachments.filter(isFileAttachment)
      const fileAttachmentsPromises = fileAttachments.map(async (attachment) => {
        const fileId = attachmentToFileIdMap.get(attachment)
        if (fileId) {
          const metadata = await createAttachmentMetadata(attachment, fileId)
          attachedContext.context.push(metadata)
        }
      })
      await Promise.all(fileAttachmentsPromises)

      // Build FormData using the updated builder
      const formData = await buildFormData({
        prompt: query,
        conversationId,
        llmProvider: 'anthropic',
        attachedContext,
        availableContexts,
      })

      addConversationMessage(conversationId, {
        role: 'user',
        content: query,
        screenshot: context?.image,
        window_context: context?.window_context,
        file_attachments: attachments.filter((a) => a.type === 'text_file'),
      })

      setInput('')
      updateLastMessageSentTimestamp()
      clearAttachments()

      const accessToken = await getAccessToken()
      await fetchResponse(conversationId, formData, !!promptApp, promptApp)
    } catch (error: any) {
      handleError(error, { method: 'handleSubmit' })
    } finally {
      setInputIsDisabled(false)
    }
  }

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  return { handleSubmit, handleIncomingContext }
}
