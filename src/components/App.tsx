'use client'

import { useEffect, useCallback } from 'react'
import Highlight, { Attachment as RuntimeAttachmentType, type HighlightContext } from '@highlight-ai/app-runtime'
import { usePathname, useRouter } from 'next/navigation'
import { debounce } from 'throttle-debounce'
import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import { useStore } from '@/providers/store-provider'
import Modals from './modals/Modals'
import { ModalContainer } from '@/components/modals/ModalContainer'
import { useShallow } from 'zustand/react/shallow'
import { initAmplitude, trackEvent } from '@/utils/amplitude'
import useAuth from '@/hooks/useAuth'
import { decodeJwt } from 'jose'
import { getPromptAppBySlug } from '@/utils/prompts'
import ToastContainer from '@/components/Toast/ToastContainer'
import usePromptApps from '@/hooks/usePromptApps'
import { useChatHistory } from '@/hooks/useChatHistory'
import { Prompt } from '@/types/supabase-helpers'
import { processAttachments } from '@/utils/contextprocessor'

function useContextReceivedHandler(navigateToNewChat: () => void) {
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
      setInput: state.setInput,
      promptApp: state.promptApp,
      startNewConversation: state.startNewConversation,
      setPrompt: state.setPrompt,
      closeAllModals: state.closeAllModals,
      clearPrompt: state.clearPrompt,
    })),
  )

  const { handleIncomingContext } = useSubmitQuery()

  useEffect(() => {
    const debouncedHandleSubmit = debounce(300, async (context: HighlightContext, promptApp?: Prompt) => {
      setInput(context.suggestion || '')
      await handleIncomingContext(context, navigateToNewChat, promptApp)
    })

    const contextDestroyer = Highlight.app.addListener('onContext', async (context: HighlightContext) => {
      // Check if it's a prompt app, if so, we should set the prompt store
      // so that the newest conversation is set to use the prompt app

      let res

      //@ts-expect-error
      if (context.promptSlug) {
        // @ts-expect-error
        res = await getPromptAppBySlug(context.promptSlug)

        if (res && res.promptApp) {
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

    const attachmentDestroyer = Highlight.app.addListener('onConversationAttachment', (attachment: string) => {
      console.log('[useContextReceivedHandler] Received conversation attachment:', attachment)

      addAttachment({
        type: 'audio',
        value: attachment,
        duration: 0,
      })

      console.log('[useContextReceivedHandler] Added attachment:', attachment)
    })

    return () => {
      contextDestroyer()
      attachmentDestroyer()
    }
  }, [promptApp])
}

/**
 * Hook that automatically registers the about me data when the app mounts.
 */
function useAboutMeRegister() {
  const setAboutMe = useStore((state) => state.setAboutMe)

  useEffect(() => {
    const getAboutMe = async () => {
      const aboutMe = await Highlight.user.getFacts()
      if (aboutMe?.length > 0) {
        const aboutMeString = aboutMe.join('\n')
        console.log('About Me:', aboutMeString)
        setAboutMe(aboutMeString)
      }
    }
    getAboutMe()
  }, [])
}

/**
 * Hook that watches for auth changes and updates the app's state to match
 * the new user.
 */
function useAuthChangeHandler() {
  const { getAccessToken } = useAuth()
  const { refreshPrompts } = usePromptApps()
  const { refreshChatHistory } = useChatHistory()

  useEffect(() => {
    const subscription = Highlight.app.addListener('onAuthUpdate', async () => {
      console.log('[useAuth] onAuthUpdate was fired from HL runtime, requesting new tokens.')

      // Force new tokens
      await getAccessToken(true)

      // Refresh prompts and chat history
      await Promise.allSettled([refreshPrompts(), refreshChatHistory()])
    })

    return () => subscription()
  })
}

/**
 * The main app component.
 *
 * This should hold all the providers.
 */
export default function App({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { getAccessToken } = useAuth()
  const setUserId = useStore((state) => state.setUserId)

  const navigateToNewChat = useCallback(() => {
    if (pathname !== '/') {
      router.push('/')
    }
  }, [pathname, router])

  useEffect(() => {
    if (typeof window !== 'undefined' && !Highlight.isRunningInHighlight()) {
      window.location.href = 'https://highlight.ing/apps/highlightchat'
    }
  }, [])

  useEffect(() => {
    const initializeAmplitude = async () => {
      try {
        // Get the access token using the useAuth hook
        const accessToken = await getAccessToken()

        // Decode the token to get the payload
        const payload = decodeJwt(accessToken)

        // Extract the user ID from the 'sub' field
        const userId = payload.sub as string

        if (!userId) {
          throw new Error('User ID not found in token')
        }

        // Set the user ID in the store
        setUserId(userId)

        // Initialize Amplitude with the user ID
        initAmplitude(userId)

        // Track the app initialization event
        trackEvent('HL Chat App Initialized', { userId })
      } catch (error) {
        console.error('Failed to initialize Amplitude:', error)

        // Fallback to a random ID if token retrieval or decoding fails
        const fallbackId = `anonymous_${Math.random().toString(36).substr(2, 9)}`
        initAmplitude(fallbackId)
        trackEvent('HL Chat App Initialized', { fallbackId, error: 'Failed to get userId' })
      }
    }

    initializeAmplitude()
  }, [])

  useContextReceivedHandler(navigateToNewChat)
  useAboutMeRegister()
  useAuthChangeHandler()

  return (
    <>
      {children}
      <ModalContainer />
      <ToastContainer />
      <Modals />
    </>
  )
}
