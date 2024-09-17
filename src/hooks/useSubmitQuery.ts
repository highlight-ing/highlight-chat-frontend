import { useEffect, useRef } from 'react'
import { useStore } from '@/providers/store-provider'
import useAuth from './useAuth'
import { useApi } from '@/hooks/useApi'
import { Prompt } from '@/types/supabase-helpers'
import { useShallow } from 'zustand/react/shallow'
import { HighlightContext } from '@highlight-ai/app-runtime'
import Highlight from '@highlight-ai/app-runtime'
import * as Sentry from '@sentry/react'
import { FileAttachment } from '@/types'

import { addAttachmentsToFormData, fetchWindows } from '@/utils/attachmentUtils'
import { parseAndHandleStreamChunk } from '@/utils/streamParser'
import { trackEvent } from '@/utils/amplitude'
import { processAttachments } from '@/utils/contextprocessor'

export const useSubmitQuery = () => {
  const { post } = useApi()
  const { getAccessToken } = useAuth()

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

  const fetchResponse = async (
    conversationId: string,
    formData: FormData,
    token: string,
    isPromptApp: boolean,
    promptApp?: Prompt,
  ) => {
    setInputIsDisabled(true)
    const startTime = Date.now()

    try {
      formData.append('conversation_id', conversationId)
      const endpoint = isPromptApp ? 'chat/prompt-as-app' : 'chat/'

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const response = await post(endpoint, formData, { version: 'v3', signal: abortController.signal })
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

        if (abortController.signal.aborted) {
          throw new Error('Chat message request aborted')
        }

        const chunk = new TextDecoder().decode(value)
        const { content, windowName } = await parseAndHandleStreamChunk(chunk, {
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

      const fileAttachments = processedAttachments.filter((a) =>
        ['pdf', 'spreadsheet', 'text_file', 'image'].includes(a.type),
      )

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

      await addAttachmentsToFormData(formData, processedAttachments)

      if (contentToUse) {
        formData.append('ocr_text', contentToUse)
      }

      const accessToken = await getAccessToken()
      await fetchResponse(conversationId, formData, accessToken, !!promptApp, promptApp)
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

      const formData = new FormData()
      formData.append('prompt', query)

      const isPromptApp = !!promptApp

      if (isPromptApp && promptApp.external_id !== undefined) {
        formData.append('app_id', promptApp.external_id)
      }

      await Sentry.startSpan({ name: 'fetchWindows', op: 'function' }, async () => {
        const windows = await fetchWindows()
        formData.append('windows', JSON.stringify(windows))
      })

      if (aboutMe) {
        formData.append('about_me', JSON.stringify(aboutMe))
      }

      if (context) {
        if (context.image) {
          formData.append('screenshot', context.image)
        }
        if (context.window_context) {
          formData.append('window_context', context.window_context)
        }
      }

      const processedAttachments = await addAttachmentsToFormData(formData, attachments)
      const { screenshot, audio, fileTitle, clipboardText, ocrText, windowContext } = processedAttachments

      const conversationId = getOrCreateConversationId()
      addConversationMessage(conversationId, {
        role: 'user',
        content: query,
        screenshot,
        ocr_text: ocrText,
        audio,
        file_title: fileTitle,
        clipboard_text: clipboardText,
        windows: await fetchWindows(),
        window_context: windowContext,
        file_attachments: attachments.filter((a) => a.type === 'text_file'),
      })

      setInput('')
      clearAttachments()

      const accessToken = await getAccessToken()
      await fetchResponse(conversationId, formData, accessToken, isPromptApp, promptApp)
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
