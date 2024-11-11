import { usePromptEditorStore } from '@/stores/prompt-editor'
import { removePromptFromUser, savePrompt } from '@/utils/prompts'
import useAuth from './useAuth'
import { usePromptsStore } from '@/stores/prompts'
import { useEffect, useState } from 'react'
import { useStore } from '@/providers/store-provider'
import { DEFAULT_PROMPT_EXTERNAL_IDS } from '@/lib/promptapps'
import usePromptApps from './usePromptApps'
import { sendExternalMessage, openApp } from '@/utils/highlightService'

export function usePromptEditor() {
  // STATE
  const [saveDisabled, setSaveDisabled] = useState(false)

  // HOOKS
  const { promptEditorData, setPromptEditorData, needSave, saving, setNeedSave, settingsHasNoErrors, setSaving } =
    usePromptEditorStore()
  const { updatePrompt, addPrompt } = usePromptsStore()
  const addToast = useStore((state) => state.addToast)
  const closeModal = useStore((state) => state.closeModal)
  const { getAccessToken } = useAuth()
  const { selectPrompt, refreshPinnedPrompts } = usePromptApps()

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

      closeModal('create-prompt')

      selectPrompt(res.prompt.external_id, true, false)
    } else if (res?.prompt) {
      // Update the prompts store with the updated prompt data
      updatePrompt(res.prompt)
      
      const message = {
        type: 'prompt-edited',
        promptId: res.prompt.id,
      }
      // Open the app and send message before closing modal
      await openApp('dev2')
      await sendExternalMessage('dev2', message)

      closeModal('edit-prompt')
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
