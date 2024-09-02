'use client'

import Highlight, {
  type AppOpenEventOptions,
  type NavigateOptions,
  type OpenModalOptions,
} from '@highlight-ai/app-runtime'
import { useEffect } from 'react'
import { useStore } from '@/providers/store-provider'
import { useRouter } from 'next/navigation'
import usePromptApps from '@/hooks/usePromptApps'

export const useOnAppOpen = () => {
  const router = useRouter()
  const openModal = useStore((state) => state.openModal)
  const startNewConversation = useStore((state) => state.startNewConversation)
  const clearPrompt = useStore((state) => state.clearPrompt)
  const { selectPrompt, getPromptBySlug } = usePromptApps()

  useEffect(() => {
    const onOpen = async (eventOpts: boolean | AppOpenEventOptions) => {
      let isActiveApp
      if (typeof eventOpts === 'boolean') {
        isActiveApp = eventOpts
      } else {
        isActiveApp = eventOpts?.isActiveApp

        // Handle event actions
        if (eventOpts?.action?.type === 'openModal') {
          const modalOptions = eventOpts.action.options as OpenModalOptions
          openModal(modalOptions.id, modalOptions.context)
          return
        } else if (eventOpts?.action?.type === 'navigate') {
          const navigateOptions = eventOpts.action.options as NavigateOptions
          if (navigateOptions.route.startsWith('/new')) {
            const param = navigateOptions.route.split('/').pop()
            if (param && param !== 'new') {
              const prompt = await getPromptBySlug(param)
              if (prompt) {
                await selectPrompt(prompt, true)
                return
              }
            }
            startNewConversation()
            clearPrompt()
          } else {
            router.push(navigateOptions.route)
          }
          return
        }
      }

      if (isActiveApp) {
        startNewConversation()
        clearPrompt()
      }
    }
    const unsub = Highlight.app.addListener('onOpen', onOpen)
    return () => {
      unsub()
    }
  }, [])
}
