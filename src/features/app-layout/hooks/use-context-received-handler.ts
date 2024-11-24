'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { manualTranscriptTextAtom, selectedAudioNoteAtom, transcriptOpenAtom } from '@/atoms/transcript-viewer'
import { trackEvent } from '@/utils/amplitude'
import { processAttachments } from '@/utils/contextprocessor'
import { countPromptView, getPromptAppBySlug } from '@/utils/prompts'
import Highlight, { Attachment as RuntimeAttachmentType, type HighlightContext } from '@highlight-ai/app-runtime'
import { useSetAtom } from 'jotai'
import { debounce } from 'throttle-debounce'
import { useShallow } from 'zustand/react/shallow'

import { Prompt } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'
import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import { useStore } from '@/components/providers/store-provider'

export function useContextReceivedHandler() {
  const {
    addAttachment,
    setHighlightContext,
    setInput,
    promptApp,
    startNewConversation,
    setPrompt,
    closeAllModals,
    clearPrompt,
  } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
      setHighlightContext: state.setHighlightContext,
      setInput: state.setInputOverride,
      promptApp: state.promptApp,
      startNewConversation: state.startNewConversation,
      setPrompt: state.setPrompt,
      closeAllModals: state.closeAllModals,
      clearPrompt: state.clearPrompt,
    })),
  )

  const { getAccessToken } = useAuth()

  const { handleIncomingContext } = useSubmitQuery()

  const router = useRouter()

  const setTranscriptOpen = useSetAtom(transcriptOpenAtom)
  const setManualTranscriptText = useSetAtom(manualTranscriptTextAtom)
  const selectedAudioNote = useSetAtom(selectedAudioNoteAtom)

  React.useEffect(() => {
    const debouncedHandleSubmit = debounce(300, async (context: HighlightContext, promptApp?: Prompt) => {
      setInput(context.suggestion || '')
      await handleIncomingContext(context, promptApp)
    })

    const contextDestroyer = Highlight.app.addListener('onContext', async (context: HighlightContext) => {
      // Check if it's a prompt app, if so, we should set the prompt store
      // so that the newest conversation is set to use the prompt app

      let res

      //@ts-expect-error
      if (context.promptSlug) {
        //@ts-expect-error
        res = await getPromptAppBySlug(context.promptSlug)

        const accessToken = await getAccessToken()

        if (res && res.promptApp) {
          countPromptView(res.promptApp.external_id, accessToken)

          setPrompt({
            promptApp: res.promptApp,
            promptName: res.promptApp.name,
            promptDescription: res.promptApp.description ?? '',
            promptAppName: res.promptApp.slug ?? '',
            prompt: res.promptApp.prompt_text ?? '',
          })
        }
      } else {
        clearPrompt()
      }

      // Close all modals
      closeAllModals()

      startNewConversation()
      const attachments = processAttachments(context.attachments || []) as RuntimeAttachmentType[]
      const newContext = { ...context, attachments }
      setHighlightContext(newContext)
      debouncedHandleSubmit(newContext, res?.promptApp ?? undefined)
    })

    const attachmentDestroyer = Highlight.app.addListener('onConversationAttachment', async (attachment: string) => {
      startNewConversation()
      clearPrompt()

      router.push('/')
      trackEvent('HL Chat New Conversation Started', {})

      await new Promise((resolve) => setTimeout(resolve, 600))

      addAttachment({
        type: 'audio',
        value: attachment,
        duration: 0,
      })

      setTranscriptOpen(true)
      selectedAudioNote({
        transcript: attachment,
      })
    })

    return () => {
      contextDestroyer()
      attachmentDestroyer()
    }
  }, [promptApp])
}
