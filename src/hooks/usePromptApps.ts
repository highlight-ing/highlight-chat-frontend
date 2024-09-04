import { useStore } from '@/providers/store-provider'
import { addPromptToUser, countPromptView, fetchPrompts, fetchPinnedPrompts, fetchPromptText } from '@/utils/prompts'
import useAuth from '@/hooks/useAuth'
import { Prompt } from '@/types/supabase-helpers'
import { PinnedPrompt } from '@/types'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useMemo, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'

let loadPromptsPromise: Promise<Prompt[]> | null = null

export default (loadPrompts?: boolean) => {
  const { getAccessToken } = useAuth()
  const addToast = useStore((state) => state.addToast)

  const {
    prompts,
    setPrompts,
    promptUserId,
    setPromptUserId,
    setPrompt,
    pinnedPrompts,
    setPinnedPrompts,
    clearPrompt,
    startNewConversation,
    isPromptsLoaded,
    setIsPromptsLoaded,
  } = useStore(
    useShallow((state) => ({
      prompts: state.prompts,
      setPrompts: state.setPrompts,
      promptUserId: state.promptUserId,
      setPromptUserId: state.setPromptUserId,
      pinnedPrompts: state.pinnedPrompts,
      setPinnedPrompts: state.setPinnedPrompts,
      setPrompt: state.setPrompt,
      clearPrompt: state.clearPrompt,
      startNewConversation: state.startNewConversation,
      isPromptsLoaded: state.isPromptsLoaded,
      setIsPromptsLoaded: state.setIsPromptsLoaded,
    })),
  )

  const [isLoadingPrompts, setLoadingPrompts] = useState(loadPrompts || !isPromptsLoaded)

  const communityPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => prompt.user_id !== promptUserId && prompt.public)
      .sort((a, b) => (b.public_use_number || 0) - (a.public_use_number || 0))
      .slice(0, 10)
  }, [prompts, promptUserId])

  const myPrompts = useMemo(() => {
    return prompts.filter((prompt) => prompt.user_id === promptUserId)
  }, [prompts, promptUserId])

  const refreshPrompts = async () => {
    if (loadPromptsPromise && !loadPrompts) {
      return loadPromptsPromise
    }

    loadPromptsPromise = new Promise<Prompt[]>(async (resolve) => {
      console.log('Refreshing prompts')
      setLoadingPrompts(true)
      const accessToken = await getAccessToken()
      const response = await fetchPrompts(accessToken)
      if (response.error) {
        setLoadingPrompts(false)
        resolve([])
        loadPromptsPromise = null
        return
      }
      setPromptUserId(response.userId)
      setPrompts(response.prompts ?? [])
      await refreshPinnedPrompts(accessToken)
      setLoadingPrompts(false)
      setIsPromptsLoaded(true)
      resolve(response.prompts ?? [])
      loadPromptsPromise = null
    })

    return loadPromptsPromise
  }

  const refreshPinnedPrompts = async (accessToken: string) => {
    const pinned = await fetchPinnedPrompts(accessToken ?? (await getAccessToken()))
    // @ts-ignore
    if (Array.isArray(pinned)) {
      setPinnedPrompts(pinned ?? [])
    }

    try {
      //@ts-expect-error
      globalThis.highlight.internal.reloadPrompts()
    } catch (err) {
      console.error('Error installing app', err)
    }
  }

  const selectPrompt = async (prompt: Prompt, isNewConversation?: boolean, pinPrompt?: boolean) => {
    trackEvent('Prompt Apps', {
      action: 'Prompt selected',
      promptName: prompt.name,
      promptSlug: prompt.slug,
      promptId: prompt.external_id,
    })

    if (!prompt.slug) {
      return
    }

    if (prompt.slug === 'hlchat') {
      clearPrompt()
      return
    }

    const accessToken = await getAccessToken()

    // Count the prompt view
    countPromptView(prompt.external_id, accessToken)

    // Fetch the prompt

    let text

    if (!prompt.is_handlebar_prompt) {
      text = await fetchPromptText(prompt.external_id)
    }

    if (typeof text === 'object' && 'error' in text) {
      addToast({
        title: 'Error fetching prompt',
        description: text.error,
        type: 'error',
        timeout: 15000,
      })

      return
    }

    setPrompt({
      promptApp: prompt,
      promptName: prompt.name,
      promptDescription: prompt.description!,
      promptAppName: prompt.slug!,
      prompt: text,
    })

    if (isNewConversation !== false) {
      startNewConversation()
    }

    if (pinPrompt !== false) {
      // Add the app to the user's list of "added" apps
      // if it's not already there
      await addPromptToUser(prompt.external_id, accessToken).catch((err) => {
        addToast({
          title: 'Error adding chat app',
          description: err.message ?? err.toString(),
          type: 'error',
          timeout: 15000,
        })
      })

      try {
        //@ts-expect-error
        globalThis.highlight.internal.installApp(prompt.slug)
      } catch (err) {
        console.error('Error installing app', err)
      }
      refreshPinnedPrompts(accessToken)
    }
  }

  const getPrompt = async (promptId: string | number) => {
    let apps: Prompt[] = prompts
    if (!isPromptsLoaded) {
      apps = (await refreshPrompts()) ?? []
    }
    // @ts-ignore
    return apps.find((app) => app.id == promptId)
  }

  const getPromptBySlug = async (slug: string) => {
    let apps: Prompt[] = prompts
    if (!isPromptsLoaded) {
      apps = (await refreshPrompts()) ?? []
    }
    // @ts-ignore
    return apps.find((app) => app.slug == slug)
  }

  useEffect(() => {
    if (!loadPrompts && isPromptsLoaded) {
      return
    }
    refreshPrompts()
  }, [loadPrompts])

  return {
    isLoadingPrompts,
    prompts,
    communityPrompts,
    myPrompts,
    pinnedPrompts,
    getPrompt,
    getPromptBySlug,
    refreshPrompts,
    refreshPinnedPrompts,
    selectPrompt,
  }
}
