import { useStore } from '@/providers/store-provider'
import { useEffect, useMemo, useState } from 'react'
import { addPromptToUser, fetchPrompts, fetchPromptText } from '@/utils/prompts'
import useAuth from '@/hooks/useAuth'
import { Prompt } from '@/types/supabase-helpers'
import { useShallow } from 'zustand/react/shallow'

export default () => {
  const { getAccessToken } = useAuth()
  const [isLoadingPrompts, setLoadingPrompts] = useState(true)

  const { prompts, setPrompts, promptUserId, setPromptUserId, setPrompt, clearPrompt, startNewConversation } = useStore(
    useShallow((state) => ({
      prompts: state.prompts,
      setPrompts: state.setPrompts,
      promptUserId: state.promptUserId,
      setPromptUserId: state.setPromptUserId,
      setPrompt: state.setPrompt,
      clearPrompt: state.clearPrompt,
      startNewConversation: state.startNewConversation,
    })),
  )

  const communityPrompts = useMemo(() => {
    return prompts.filter((prompt) => prompt.user_id !== promptUserId).filter((prompt) => prompt.public)
  }, [prompts, promptUserId])

  const myPrompts = useMemo(() => {
    return prompts.filter((prompt) => prompt.user_id === promptUserId)
  }, [prompts, promptUserId])

  const refreshPrompts = async () => {
    setLoadingPrompts(true)
    const accessToken = await getAccessToken()
    const response = await fetchPrompts(accessToken)
    if (response.error) {
      setLoadingPrompts(false)
      return
    }
    setPromptUserId(response.userId)
    setPrompts(response.prompts ?? [])
    setLoadingPrompts(false)
  }

  const selectPrompt = async (prompt: Prompt) => {
    if (!prompt.slug) {
      return
    }

    if (prompt.slug === 'hlchat') {
      clearPrompt()
      return
    }

    const accessToken = await getAccessToken()

    // Fetch the prompt

    let text

    if (!prompt.is_handlebar_prompt) {
      text = await fetchPromptText(prompt.external_id)
    }

    setPrompt({
      promptApp: prompt,
      promptName: prompt.name,
      promptDescription: prompt.description!,
      promptAppName: prompt.slug!,
      prompt: text,
    })

    startNewConversation()

    // Add the app to the user's list of "added" apps
    // if it's not already there
    await addPromptToUser(prompt.external_id, accessToken)

    try {
      //@ts-expect-error
      globalThis.highlight.internal.installApp(prompt.slug)
    } catch (err) {
      console.error('Error installing app', err)
    }
    // router.push(`/`)
  }

  useEffect(() => {
    refreshPrompts()
  }, [])

  return {
    isLoadingPrompts,
    prompts,
    communityPrompts,
    myPrompts,
    refreshPrompts,
    selectPrompt,
  }
}
