import { usePromptEditorStore } from '@/stores/prompt-editor'
import Button from '@/components/Button/Button'
import { Prompt } from '@/types/supabase-helpers'

export function PromptCopyButton({ prompt }: { prompt: Prompt }) {
  const { promptEditorData } = usePromptEditorStore()
  const { setPromptEditorData } = usePromptEditorStore()

  function onCopyPromptClick() {
    navigator.clipboard.writeText(promptEditorData.appPrompt)
  }

  return (
    <Button
      onClick={onCopyPromptClick}
      size={'large'}
      variant={'ghost'}
      style={{ marginRight: '6px' }}
      // TODO: disabled={!promptEditorData.appPrompt}
      disabled={true}
    >
      Copy
    </Button>
  )
}
