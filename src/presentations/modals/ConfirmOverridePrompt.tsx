import { ModalObjectProps } from '@/types'

import { useStore } from '@/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { PromptEditorData } from '@/stores/prompt-editor'

export interface ConfirmOverridePromptContext {
  data: Partial<PromptEditorData>
}

export default function ConfirmOverridePrompt({ id, context }: ModalObjectProps) {
  const { data } = context as ConfirmOverridePromptContext

  const closeModal = useStore((state) => state.closeModal)
  const setPromptEditorData = useStore((state) => state.setPromptEditorData)

  const onOverride = async () => {
    setPromptEditorData(data)
    closeModal(id)
  }

  return (
    <ConfirmationModal
      id={id}
      primaryAction={{
        label: 'Override',
        onClick: onOverride,
      }}
      secondaryAction={{
        label: 'Nevermind',
        onClick: () => closeModal(id),
      }}
    >
      <div>
        <span className="text-red-400 font-medium">Warning:</span> Using this template will override your current
        action.
      </div>
    </ConfirmationModal>
  )
}
