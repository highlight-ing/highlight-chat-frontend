import { usePromptEditorStore } from '@/stores/prompt-editor'
import { savePrompt } from '@/utils/prompts'

export default function useSavePromptEditor() {
  const { promptEditorData, setPromptEditorData, needSave, setNeedSave } = usePromptEditorStore()

  async function save() {
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

    const res = await savePrompt(formData)

    if (res && res.error) {
      console.error('Error saving prompt:', res.error)
    }
  }

  return { save }
}
