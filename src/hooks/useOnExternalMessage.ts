'use client'

import Highlight from '@highlight-ai/app-runtime'
import { useEffect } from 'react'
import { useStore } from '@/providers/store-provider'
import { useChatHistory } from '@/hooks/useChatHistory'
import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import { useIntegrations } from './useIntegrations'

const useOnExternalMessage = () => {
  const integrations = useIntegrations()
  const { setConversationId, openModal, closeAllModals, isModalOpen } = useStore((state) => ({
    setConversationId: state.setConversationId,
    openModal: state.openModal,
    closeAllModals: state.closeAllModals,
    isModalOpen: state.isModalOpen,
  }))
  const { refreshChatItem } = useChatHistory()
  const { addToast } = useStore((state) => ({
    addToast: state.addToast,
  }))
  const { addAttachment } = useStore((state) => ({
    addAttachment: state.addAttachment,
  }))
  const { handleSubmit } = useSubmitQuery()

  useEffect(() => {
    const removeListener = Highlight.app.addListener('onExternalMessage', async (caller: string, message: any) => {
      console.log('Received external message from:', caller)
      console.log('Message content:', message)

      if (message.conversationId) {
        console.log('Opening conversation from external event:', message.conversationId)

        // Set the conversation ID
        const conversation = await refreshChatItem(message.conversationId, true)
        if (!conversation) {
          console.error('Failed to open conversation from external event:', message.conversationId)
          return
        }
        setConversationId(message.conversationId)

        console.log(message.toolUse, message.toolUse?.type)
        // Handle toolUse if present
        if (message.toolUse && message.toolUse.type === 'tool_use') {
          if (message.toolUse.name === 'get_more_context_from_window') {
            const contextGranted = await Highlight.permissions.requestWindowContextPermission()
            const screenshotGranted = await Highlight.permissions.requestScreenshotPermission()
            if (contextGranted && screenshotGranted) {
              addToast({
                title: 'Context Granted',
                description: `Context granted for ${message.toolUse.input.window}`,
                type: 'success',
                timeout: 5000,
              })
              const screenshot = await Highlight.user.getWindowScreenshot(message.toolUse.input.window)
              addAttachment({ type: 'image', value: screenshot })

              const windowContext = await Highlight.user.getWindowContext(message.toolUse.input.window)
              const ocrScreenContents = windowContext.application.focusedWindow.rawContents
                ? windowContext.application.focusedWindow.rawContents
                : windowContext.environment.ocrScreenContents || ''
              addAttachment({ type: 'window_context', value: ocrScreenContents })

              await handleSubmit("Here's the context you requested.", undefined, {
                image: screenshot,
                window_context: ocrScreenContents,
              })
            }
          } else if (message.toolUse.name === 'create_linear_ticket') {
            console.log('Creating linear ticket', message.conversationId)
            integrations.createLinearTicket(
              message.conversationId,
              message.toolUse.input.title ?? '',
              message.toolUse.input.description ?? '',
            )
          } else if (message.toolUse.name === 'create_notion_page') {
            integrations.createNotionPage(message.conversationId, {
              title: message.toolUse.input.title,
              description: message.toolUse.input.description ?? '',
              content: message.toolUse.input.content ?? '',
            })
          } else if (message.toolUse.name === 'get_more_context_from_conversation') {
            const conversation = await Highlight.conversations.getConversationById(message.toolUse.input.conversation)
            if (!conversation) {
              console.error('Failed to open conversation from external event:', message.toolUse.input.conversation)
              addToast({
                title: 'Error',
                description: `Failed to fetch conversation. Please try again.`,
                type: 'error',
                timeout: 5000,
              })
              return
            } else if (message.toolUse) {
              addToast({
                title: 'Conversation Fetched',
                description: `Conversation fetched successfully.`,
                type: 'success',
                timeout: 5000,
              })
              addAttachment({
                id: conversation.id,
                type: 'conversation',
                title: conversation.title,
                value: conversation.transcript,
                startedAt: conversation.startedAt,
                endedAt: conversation.endedAt,
              })

              await handleSubmit("Here's the conversation you requested.", undefined, {
                conversation: {
                  id: conversation.id,
                  type: 'conversation',
                  title: conversation.title,
                  text: conversation.transcript,
                  started_at: conversation.startedAt.toISOString(),
                  ended_at: conversation.endedAt.toISOString(),
                },
              })
            }
          }
        }

        if (message.shareAction) {
          // Submit a message with the notion tool enabled
          let prompt

          switch (message.shareAction) {
            case 'notion':
              prompt = 'Create a new Notion page inferring the title and content from the conversation.'
              break
            case 'linear':
              prompt = 'Create a new Linear ticket inferring the title and description from the conversation.'
              break
            default:
              return
          }

          await handleSubmit(prompt, undefined, undefined, {
            create_notion_page: message.shareAction === 'notion',
            create_linear_ticket: message.shareAction === 'linear',
          })
        }
      } else if (message.type === 'customize-prompt') {
        console.log('Customize prompt message received for prompt:', message.prompt)

        const openCustomizePromptModal = () => {
          closeAllModals()
          openModal('edit-prompt', { prompt: message.prompt })
        }

        if (isModalOpen('edit-prompt')) {
          openModal('unsaved-changes', { onContinue: openCustomizePromptModal })
        } else {
          openCustomizePromptModal()
        }
      }
    })

    // Clean up the listener when the component unmounts
    return () => {
      removeListener()
    }
  }, [setConversationId, openModal])
}

export default useOnExternalMessage
