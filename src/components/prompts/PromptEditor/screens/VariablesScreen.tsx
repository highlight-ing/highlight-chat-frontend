import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'

export default function VariablesScreen() {
  const { promptEditorData, setPromptEditorData, onboarding } = usePromptEditorStore()

  return (
    <IntelliPrompt value={promptEditorData.systemPrompt} onChange={(e) => setPromptEditorData({ systemPrompt: e })} />
  )
}
