import Button from '@/components/Button/Button'
import { usePromptEditor } from '@/hooks/usePromptEditor'
import { usePromptEditorStore } from '@/stores/prompt-editor'

export default function PromptSaveButton() {
  const { save, saveDisabled } = usePromptEditor()
  const { selectedScreen, setSelectedScreen, onboarding, promptEditorData } = usePromptEditorStore()

  const isNewPrompt = promptEditorData.externalId === undefined
  const saveMode = selectedScreen === 'settings' || !isNewPrompt

  function onButtonClick() {
    if (saveMode) {
      save()
    } else {
      setSelectedScreen('settings')
    }
  }

  return (
    <Button
      size={'large'}
      variant={saveMode ? (saveDisabled ? 'tertiary' : 'primary') : 'tertiary'}
      onClick={onButtonClick}
      disabled={saveMode ? saveDisabled : false || onboarding.isOnboarding}
    >
      {saveMode ? 'Save' : 'Next'}
    </Button>
  )
}
