import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'

export default function AppScreen() {
  const { promptEditorData, setPromptEditorData } = usePromptEditorStore()

  return <IntelliPrompt value={promptEditorData.appPrompt} onChange={(e) => setPromptEditorData({ appPrompt: e })} />
}
