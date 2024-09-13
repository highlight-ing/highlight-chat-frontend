import { useStore } from '@/providers/store-provider'
import { addPromptToUser, countPromptView, fetchPrompts, fetchPinnedPrompts } from '@/utils/prompts'
import useAuth from '@/hooks/useAuth'
import { Prompt } from '@/types/supabase-helpers'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useMemo, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'

let loadPromptsPromise: Promise<Prompt[]> | null = null

export default (loadPrompts?: boolean) => {
  const { getAccessToken } = useAuth()
  const addToast = useStore((state) => state.addToast)

  const {
    userId,
    prompts,
    setPrompts,
    setPrompt,
    pinnedPrompts,
    setPinnedPrompts,
    startNewConversation,
    isPromptsLoaded,
    setIsPromptsLoaded,
  } = useStore(
    useShallow((state) => ({
      userId: state.userId,
      prompts: state.prompts,
      setPrompts: state.setPrompts,
      pinnedPrompts: state.pinnedPrompts,
      setPinnedPrompts: state.setPinnedPrompts,
      setPrompt: state.setPrompt,
      startNewConversation: state.startNewConversation,
      isPromptsLoaded: state.isPromptsLoaded,
      setIsPromptsLoaded: state.setIsPromptsLoaded,
    })),
  )

  const [isLoadingPrompts, setLoadingPrompts] = useState(loadPrompts || !isPromptsLoaded)

  const communityPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => prompt.user_id !== userId && prompt.public)
      .sort((a, b) => (b.public_use_number || 0) - (a.public_use_number || 0))
      .filter((prompt) => prompt.can_trend)
      .slice(0, 10)
  }, [prompts, userId])

  const myPrompts = useMemo(() => {
    return prompts.filter((prompt) => prompt.user_id === userId)
  }, [prompts, userId])

  const refreshPrompts = async () => {
    if (loadPromptsPromise && !loadPrompts) {
      return loadPromptsPromise
    }

    loadPromptsPromise = new Promise<Prompt[]>(async (resolve) => {
      console.log('Refreshing prompts...')
      setLoadingPrompts(true)

      const accessToken = await getAccessToken()
      const response = await fetchPrompts(accessToken)

      if (response.error) {
        setLoadingPrompts(false)
        resolve([])
        loadPromptsPromise = null
        return
      }

      setPrompts(response.prompts ?? [])

      await refreshPinnedPrompts()

      setLoadingPrompts(false)
      setIsPromptsLoaded(true)
      resolve(response.prompts ?? [])
      loadPromptsPromise = null
    })

    return loadPromptsPromise
  }

  const refreshPinnedPrompts = async () => {
    const pinned = await fetchPinnedPrompts(await getAccessToken())
    // @ts-ignore
    if (Array.isArray(pinned)) {
      setPinnedPrompts(pinned ?? [])
    }

    try {
      //@ts-expect-error
      globalThis.highlight.internal.reloadPrompts()
    } catch (err) {
      console.error('Error reloading prompts', err)
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

  const getPromptByExternalId = async (externalId: string) => {
    let apps: Prompt[] = prompts
    if (!isPromptsLoaded) {
      apps = (await refreshPrompts()) ?? []
    }
    // @ts-ignore
    return apps.find((app) => app.external_id == externalId)
  }

  const selectPrompt = async (promptExternalId: string, isNewConversation?: boolean, pinPrompt?: boolean) => {
    const prompt = await getPromptByExternalId(promptExternalId)

    if (!prompt) {
      // TODO: Add some error handling logic here (like a toast)
      return
    }

    trackEvent('Prompt Apps', {
      action: 'Prompt selected',
      promptName: prompt.name,
      promptSlug: prompt.slug,
      promptId: prompt.external_id,
    })

    if (!prompt.slug) {
      return
    }

    const accessToken = await getAccessToken()

    // Count the prompt view
    countPromptView(prompt.external_id, accessToken)

    setPrompt({
      promptApp: prompt,
      promptName: prompt.name,
      promptDescription: prompt.description!,
      promptAppName: prompt.slug!,
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
        globalThis.highlight.internal.reloadPrompts()
      } catch (err) {
        console.error('Error installing app', err)
      }
      refreshPinnedPrompts()
    }
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
