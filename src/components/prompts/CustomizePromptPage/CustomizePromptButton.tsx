import Button from '@/components/Button/Button'
import { Prompt } from '@/types/supabase-helpers'

export function CustomizePromptButton({ prompt }: { prompt: Prompt }) {
  function onCopyPromptClick() {
    alert('Customize')
  }

  return (
    <Button onClick={onCopyPromptClick} size={'large'} variant={'ghost'} style={{ marginRight: '6px' }}>
      Customize
    </Button>
  )
}
