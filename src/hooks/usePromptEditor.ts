import { usePromptEditorStore } from '@/stores/prompt-editor'
import { savePrompt } from '@/utils/prompts'
import useAuth from './useAuth'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { usePromptsStore } from '@/stores/prompts'

export function usePromptEditor() {
  const { promptEditorData, setPromptEditorData, needSave, setNeedSave } = usePromptEditorStore()
  const { updatePrompt, addPrompt } = usePromptsStore()

  const { getAccessToken } = useAuth()

  async function save() {
    const accessToken = await getAccessToken()

    console.log('Saving prompt editor data...')

    if (!needSave) {
      return
    }

    const formData = new FormData()

    if (promptEditorData.externalId) {
      formData.append('externalId', promptEditorData.externalId)
    }

    formData.append('name', promptEditorData.name)
    formData.append('description', promptEditorData.description)
    formData.append('appPrompt', promptEditorData.appPrompt)
    formData.append('suggestionsPrompt', promptEditorData.suggestionsPrompt)
    formData.append('visibility', promptEditorData.visibility)

    if (promptEditorData.uploadingImage) {
      formData.append('uploadingImage', promptEditorData.uploadingImage)
    }

    const res = await savePrompt(formData, accessToken)

    if (res && res.error) {
      console.error('Error saving prompt:', res.error)
      return
    }

    if (res?.new) {
      setPromptEditorData({
        externalId: res.prompt.external_id,
      })
      addPrompt(res.prompt)
    } else if (res?.prompt) {
      updatePrompt(res.prompt)
    }

    setNeedSave(false)

    // Update the prompts store
  }

  return { save }
}
