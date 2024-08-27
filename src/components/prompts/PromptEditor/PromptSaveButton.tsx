import Button from '@/components/Button/Button'
import { usePromptEditor } from '@/hooks/usePromptEditor'
import { usePromptEditorStore } from '@/stores/prompt-editor'

export default function PromptSaveButton() {
  const { save, saveDisabled } = usePromptEditor()
  const { selectedScreen, setSelectedScreen } = usePromptEditorStore()

  const saveMode = selectedScreen === 'settings'

  function onButtonClick() {
    if (saveMode) {
      save()
    } else if (selectedScreen === 'app') {
      // Temporary until we remove suggestions prompt entirely
      setSelectedScreen('suggestions')
    } else {
      setSelectedScreen('settings')
    }
  }

  return (
    <Button
      size={'large'}
      variant={saveMode ? (saveDisabled ? 'tertiary' : 'primary') : 'tertiary'}
      onClick={onButtonClick}
      disabled={saveMode ? saveDisabled : false}
    >
      {saveMode ? 'Save' : 'Next'}
    </Button>
  )
}
