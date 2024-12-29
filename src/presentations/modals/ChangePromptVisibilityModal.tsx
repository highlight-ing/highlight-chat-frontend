import { usePromptsStore } from '@/stores/prompts'
import { ModalObjectProps } from '@/types'

import { Prompt } from '@/types/supabase-helpers'
import { updatePromptVisibility } from '@/utils/prompts'
import useAuth from '@/hooks/useAuth'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { useStore } from '@/components/providers/store-provider'

export interface ChangePromptVisibilityModalContext {
  prompt: Prompt
}

export default function ChangePromptVisibilityModal({ id, context }: ModalObjectProps) {
  const { prompt } = context as ChangePromptVisibilityModalContext
  const { getAccessToken } = useAuth()
  const { updatePrompt } = usePromptsStore()
  const addToast = useStore((state) => state.addToast)

  const closeModal = useStore((state) => state.closeModal)

  const onUpdate = async () => {
    const authToken = await getAccessToken()
    const res = await updatePromptVisibility(prompt.external_id, !prompt.public, authToken)

    if (res && res.error) {
      console.error('Error while calling updatePromptVisibility', res.error)
      return
    }

    updatePrompt({ ...prompt, public: !prompt.public })

    closeModal(id)

    addToast({
      title: 'Prompt visibility updated',
      description: 'Your prompt visibility has been updated.',
      type: 'success',
      timeout: 1500,
    })
  }

  return (
    <ConfirmationModal
      id={id}
      header="Update prompt visibility"
      primaryAction={{
        label: 'Update visibility',
        onClick: onUpdate,
        variant: 'success',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => closeModal(id),
      }}
    >
      <div>
        <span className="font-medium">Note:</span> Changing the visibility of this prompt will update access for all
        users who can currently see it.
      </div>
    </ConfirmationModal>
  )
}
