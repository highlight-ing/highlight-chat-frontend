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
import { countPromptView, getPromptAppBySlug } from '@/utils/prompts'
import ToastContainer from '@/components/Toast/ToastContainer'
import usePromptApps from '@/hooks/usePromptApps'
import { useChatHistory } from '@/hooks/useChatHistory'
import { Prompt } from '@/types/supabase-helpers'
import { processAttachments } from '@/utils/contextprocessor'
import * as Sentry from '@sentry/react'
import { checkForFollowUpFeedback, markFollowUpFeedbackAsShown } from '@/app/(app)/actions'

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

  const { getAccessToken } = useAuth()

  const { handleIncomingContext } = useSubmitQuery()

  const router = useRouter()

  useEffect(() => {
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

    const attachmentDestroyer = Highlight.app.addListener('onConversationAttachment', (attachment: string) => {
      router.push('/')

      addAttachment({
        type: 'audio',
        value: attachment,
        duration: 0,
      })
    })

    return () => {
      contextDestroyer()
      attachmentDestroyer()
    }
  }, [promptApp])
}

/**
 * Hook that automatically registers the about me data when the app mounts or when a new message is sent.
 */
function useAboutMeRegister() {
  const setAboutMe = useStore((state) => state.setAboutMe)
  const lastMessageSentTimestamp = useStore((state) => state.lastMessageSentTimestamp)

  useEffect(() => {
    const getAboutMe = async () => {
      const aboutMe = await Highlight.user.getFacts()
      if (aboutMe?.length > 0) {
        setAboutMe(aboutMe)
      }
    }
    getAboutMe()
  }, [lastMessageSentTimestamp])
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
      // Force new tokens
      await getAccessToken(true)

      // Refresh prompts and chat history
      await Promise.allSettled([refreshPrompts(), refreshChatHistory()])
    })

    return () => subscription()
  })
}

/**
 * Hook that adds a follow up feedback toast to the app.
 */
function useShowFollowUpFeedbackToast() {
  const { getAccessToken } = useAuth()
  const addToast = useStore((state) => state.addToast)

  async function onShown() {
    const accessToken = await getAccessToken()
    await markFollowUpFeedbackAsShown(accessToken)
  }

  const toast = {
    title: "We'd love to talk to you!",
    description: "We'll happily pay you for a quick call about the product",
    timeout: 1000000,
    action: {
      label: 'Send details',
      onClick: () => {
        onShown()
        window.open('https://forms.gle/8sWMKKZUdwUVoLdR8', '_blank')
      },
    },
    onClose: async () => {
      onShown()
    },
  }

  useEffect(() => {
    const checkToPresentToast = async () => {
      const accessToken = await getAccessToken()

      const shouldPresentToast = await checkForFollowUpFeedback(accessToken)

      if (shouldPresentToast) {
        addToast(toast)
      }
    }

    checkToPresentToast()
  }, [])
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

    const initializeSentry = async () => {
      Sentry.init({
        dsn: 'https://c37160a2ddfdb8148ee3da04c5fb007e@o150878.ingest.us.sentry.io/4507940451516416',
        integrations: [Sentry.browserTracingIntegration()],
        // Tracing
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      })
      // Get the access token using the useAuth hook
      const accessToken = await getAccessToken()

      // Decode the token to get the payload
      const payload = decodeJwt(accessToken)

      // Extract the user ID from the 'sub' field
      const userId = payload.sub as string

      if (!userId) {
        throw new Error('User ID not found in token')
      }

      Sentry.setUser({ id: userId })
    }

    initializeAmplitude()
    initializeSentry()
  }, [])

  useContextReceivedHandler(navigateToNewChat)
  useAboutMeRegister()
  useAuthChangeHandler()
  useShowFollowUpFeedbackToast()

  return (
    <>
      {children}
      <ModalContainer />
      <ToastContainer />
      <Modals />
    </>
  )
}
