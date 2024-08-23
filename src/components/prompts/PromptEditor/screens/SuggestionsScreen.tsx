import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'

export default function SuggestionsScreen() {
  const { promptEditorData, setPromptEditorData } = usePromptEditorStore()

  return (
    <IntelliPrompt
      value={promptEditorData.suggestionsPrompt}
      onChange={(e) => setPromptEditorData({ suggestionsPrompt: e })}
    />
  )
}
