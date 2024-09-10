import Button from '@/components/Button/Button'
import { Prompt } from '@/types/supabase-helpers'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { APP_PROMPT_COMMENT } from '@/types'
import { useStore } from '@/providers/store-provider'

export function CustomizePromptButton({ prompt }: { prompt: Prompt }) {
  const { setSelectedScreen, setPromptEditorData, setOnboarding } = usePromptEditorStore()

  const closeModal = useStore((state) => state.closeModal)
  const openModal = useStore((state) => state.openModal)

  function onCopyPromptClick() {
    setOnboarding({ isOnboarding: false, index: 0 })
    setSelectedScreen('startWithTemplate')
    setPromptEditorData({
      appPrompt: APP_PROMPT_COMMENT + prompt.prompt_text,
    })
    openModal('create-prompt-from-template')
    closeModal('customize-prompt')
  }

  return (
    <Button onClick={onCopyPromptClick} size={'large'} variant={'ghost'} style={{ marginRight: '6px' }}>
      Customize
    </Button>
  )
}
