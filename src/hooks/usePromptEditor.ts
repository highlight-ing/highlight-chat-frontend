import { usePromptEditorStore } from '@/stores/prompt-editor'
import { savePrompt } from '@/utils/prompts'
import useAuth from './useAuth'
import { usePromptsStore } from '@/stores/prompts'
import { useEffect, useState } from 'react'
import { useStore } from '@/providers/store-provider'

export function usePromptEditor() {
  // STATE
  const [saveDisabled, setSaveDisabled] = useState(false)

  // HOOKS
  const { promptEditorData, setPromptEditorData, needSave, saving, setNeedSave, settingsHasNoErrors, setSaving } =
    usePromptEditorStore()
  const { updatePrompt, addPrompt } = usePromptsStore()
  const addToast = useStore((state) => state.addToast)
  const { getAccessToken } = useAuth()

  // EFFECTS
  useEffect(() => {
    setSaveDisabled(!(settingsHasNoErrors && needSave && !saving))
  }, [settingsHasNoErrors, needSave, saving])

  async function save() {
    setSaving(true)

    if (!needSave) {
      setSaving(false)
      return
    }

    const formData = new FormData()

    if (promptEditorData.externalId) {
      formData.append('externalId', promptEditorData.externalId)
    }

    formData.append('slug', promptEditorData.slug)
    formData.append('name', promptEditorData.name)
    formData.append('description', promptEditorData.description)
    formData.append('appPrompt', promptEditorData.appPrompt)
    formData.append('suggestionsPrompt', promptEditorData.suggestionsPrompt)
    formData.append('visibility', promptEditorData.visibility)

    if (promptEditorData.videoUrl) {
      console.log('appending the video url', promptEditorData.videoUrl)
      formData.append('videoUrl', promptEditorData.videoUrl)
    }

    if (promptEditorData.uploadingImage) {
      formData.append('uploadingImage', promptEditorData.uploadingImage)
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

    if (res?.new) {
      // Since this is a new prompt, we need to "install" the prompt.
      try {
        //@ts-expect-error
        globalThis.highlight.internal.installApp(res.prompt.slug)
      } catch (err) {
        console.error('Error installing app', err)
      }

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
      title: 'Saved changes',
      type: 'success',
    })

    setNeedSave(false)
    setSaving(false)
  }

  return { save, saveDisabled }
}
