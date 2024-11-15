import { ModalObjectProps } from '@/types'

import { useStore } from '@/components/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'

export interface UnsavedChangesModalContext {
  onContinue: () => void
}

export default function UnsavedChangesModal({ id, context }: ModalObjectProps) {
  const { onContinue } = context as UnsavedChangesModalContext
  const closeModal = useStore((state) => state.closeModal)

  return (
    <ConfirmationModal
      id={id}
      primaryAction={{
        label: 'Continue',
        onClick: onContinue,
      }}
      secondaryAction={{
        label: 'Nevermind',
        onClick: () => closeModal(id),
      }}
    >
      <div>You may have unsaved changes. Are you sure you want to continue?</div>
    </ConfirmationModal>
  )
}
