import { usePromptEditorStore } from '@/stores/prompt-editor'
import { removePromptFromUser, savePrompt } from '@/utils/prompts'
import useAuth from './useAuth'
import { usePromptsStore } from '@/stores/prompts'
import { useEffect, useState } from 'react'
import { useStore } from '@/providers/store-provider'
import { DEFAULT_PROMPT_EXTERNAL_IDS } from '@/lib/promptapps'
import usePromptApps from './usePromptApps'
import Highlight from '@highlight-ai/app-runtime'
import { z } from 'zod'

export function usePromptEditor() {
  // STATE
  const [saveDisabled, setSaveDisabled] = useState(false)

  // HOOKS
  const { promptEditorData, setPromptEditorData, needSave, saving, setNeedSave, settingsHasNoErrors, setSaving } =
    usePromptEditorStore()
  const { updatePrompt, addPrompt } = usePromptsStore()
  const addToast = useStore((state) => state.addToast)
  const { getAccessToken } = useAuth()
  const { refreshPinnedPrompts } = usePromptApps()

  // EFFECTS
  useEffect(() => {
    setSaveDisabled(!(settingsHasNoErrors && needSave && !saving))
  }, [settingsHasNoErrors, needSave, saving])

  /**
   * Saves the prompt data from the prompt-editor store to the database.
   */
  async function save() {
    setSaving(true)

    if (!needSave) {
      setSaving(false)
      return
    }

    const formData = new FormData()

    if (promptEditorData.externalId) {
      // This logic handles default prompts being forked.
      // Check if the externalId is in the DEFAULT_PROMPT_EXTERNAL_IDS array
      if (DEFAULT_PROMPT_EXTERNAL_IDS.includes(promptEditorData.externalId)) {
        // We want the prompt to have a new externalId since we're essentially forking it.

        // Unpin the prompt
        const accessToken = await getAccessToken()
        await removePromptFromUser(promptEditorData.externalId, accessToken)
        refreshPinnedPrompts()
      } else {
        formData.append('externalId', promptEditorData.externalId)
      }
    }

    formData.append('slug', promptEditorData.slug)
    formData.append('name', promptEditorData.name)
    formData.append('description', promptEditorData.description)
    formData.append('appPrompt', promptEditorData.appPrompt)
    formData.append('systemPrompt', promptEditorData.systemPrompt)
    formData.append('visibility', promptEditorData.visibility)
    formData.append('tags', JSON.stringify(promptEditorData.tags ?? []))

    if ((promptEditorData.tags?.length ?? 0) < 1) {
      // Use an LLM inference to generate new tags

      const zodSchema = z.object({
        tags: z.array(
          z.string({
            description: 'A tag for the prompt',
          }),
        ),
      })

      const res = Highlight.inference.getStructuredTextPrediction(zodSchema, [
        {
          role: 'system',
          content: `You are a specialized tag selector for LLM system prompts. Your task is to analyze the given system prompt and select the most appropriate tag from a predefined list. Follow these guidelines:

            1. Carefully read and understand the entire system prompt provided.
            2. Consider the main focus, purpose, and potential applications of the prompt.
            3. Select the single most relevant tag from this list:
              writing, journal, mental health, creative writing, story, essay, self-discovery, high school, middle school, elementary, college, business, social media, resume, dating, coding, fiction, non-fiction, poetry, children, adults, teens, self-improvement, productivity, marketing, academic, research, analysis, brainstorming, summarization
              
              System prompt to analyze:
              ${promptEditorData.systemPrompt}
              `,
        },
      ])

      for await (const tagResult of res) {
        console.log('Generated tag:', tagResult)
      }

      console.log('res', res)
    }

    if (promptEditorData.preferredAttachment) {
      formData.append('preferredAttachment', promptEditorData.preferredAttachment)
    }

    if (promptEditorData.videoUrl) {
      formData.append('videoUrl', promptEditorData.videoUrl)
    }

    if (promptEditorData.uploadingImage) {
      formData.append('uploadingImage', promptEditorData.uploadingImage)
    }

    if (promptEditorData.enabledAutomations) {
      formData.append('enabledAutomations', JSON.stringify(promptEditorData.enabledAutomations))
    }

    const accessToken = await getAccessToken()
    const res = await savePrompt(formData, accessToken)

    if (res && res.error) {
      console.error('Error saving prompt:', res.error)
      setSaving(false)
      addToast({
        title: 'Error saving prompt',
        description: res.error,
        type: 'error',
      })
      return
    }

    try {
      //@ts-expect-error
      globalThis.highlight.internal.reloadPrompts()
    } catch (err) {
      console.error('Error reloading prompts', err)
    }

    if (res?.new) {
      // Reload Electron's prompt apps
      setPromptEditorData({
        externalId: res.prompt.external_id,
        slug: res.prompt.slug ?? '',
        image: res.prompt.image ? `${res.prompt.image}.${res.prompt.user_images?.file_extension}` : undefined,
      })

      addPrompt(res.prompt)
    } else if (res?.prompt) {
      // Update the prompts store with the updated prompt data
      updatePrompt(res.prompt)
    }

    addToast({
      title: 'Prompt Updated',
      description: 'Your latest prompt is active everywhere.',
      type: 'success',
      timeout: 7500,
    })

    setNeedSave(false)
    setSaving(false)
  }

  return { save, saveDisabled }
}
