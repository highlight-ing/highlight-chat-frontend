import { usePromptEditorStore } from '@/stores/prompt-editor'
import { savePrompt } from '@/utils/prompts'
import useAuth from './useAuth'
import { usePromptsStore } from '@/stores/prompts'
import { useEffect, useState } from 'react'

export function usePromptEditor() {
  // STATE
  const [saveDisabled, setSaveDisabled] = useState(false)

  // HOOKS
  const { promptEditorData, setPromptEditorData, needSave, setNeedSave, settingsHasNoErrors, setSaving } =
    usePromptEditorStore()
  const { updatePrompt, addPrompt } = usePromptsStore()
  const { getAccessToken } = useAuth()

  // EFFECTS
  useEffect(() => {
    console.log('settingsHasNoErrors', settingsHasNoErrors)
    console.log('needSave', needSave)
    setSaveDisabled(!(settingsHasNoErrors && needSave))
  }, [settingsHasNoErrors, needSave])

  async function save() {
    setSaving(true)

    const accessToken = await getAccessToken()

    console.log('Saving prompt editor data...')

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
      formData.append('videoUrl', promptEditorData.videoUrl)
    }

    if (promptEditorData.uploadingImage) {
      formData.append('uploadingImage', promptEditorData.uploadingImage)
    }

    const res = await savePrompt(formData, accessToken)

    if (res && res.error) {
      console.error('Error saving prompt:', res.error)
      setSaving(false)
      return
    }

    if (res?.new) {
      setPromptEditorData({
        externalId: res.prompt.external_id,
      })
      addPrompt(res.prompt)
    } else if (res?.prompt) {
      // Update the prompts store with the updated prompt data
      updatePrompt(res.prompt)
    }

    setNeedSave(false)
    setSaving(false)
  }

  return { save, saveDisabled }
}
