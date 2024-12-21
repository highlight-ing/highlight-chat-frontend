import { usePromptEditorStore } from '@/stores/prompt-editor'

import { trackEvent } from '@/utils/amplitude'
import { usePromptEditor } from '@/hooks/usePromptEditor'
import Button from '@/components/Button/Button'

export default function PromptSaveButton() {
  const { save, saveDisabled } = usePromptEditor()
  const { selectedScreen, setSelectedScreen, onboarding, promptEditorData } = usePromptEditorStore()

  const isNewPrompt = promptEditorData.externalId === undefined
  const saveMode = selectedScreen === 'settings' || !isNewPrompt

  function onButtonClick() {
    if (saveMode) {
      trackEvent('Prompt Editor', {
        action: 'Save clicked',
        isNewPrompt: isNewPrompt,
        promptName: promptEditorData.name,
        promptSlug: promptEditorData.slug,
        promptId: promptEditorData.externalId,
      })

      save()
    } else {
      trackEvent('Prompt Editor', {
        action: 'Next clicked',
        isNewPrompt: isNewPrompt,
        promptName: promptEditorData.name,
        promptSlug: promptEditorData.slug,
        promptId: promptEditorData.externalId,
      })

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
