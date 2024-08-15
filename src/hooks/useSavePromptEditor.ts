import { usePromptEditorStore } from '@/stores/prompt-editor'
import { savePrompt } from '@/utils/prompts'

export default function useSavePromptEditor() {
  const { promptEditorData, setPromptEditorData, needSave, setNeedSave } = usePromptEditorStore()

  async function save() {
    if (!needSave) {
      return
    }

    const res = await savePrompt(promptEditorData)
  }

  return { save }
}
