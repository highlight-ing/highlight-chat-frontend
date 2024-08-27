import { ModalObjectProps } from '@/types'

import { useStore } from '@/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { Prompt } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'
import { updatePromptVisibility } from '@/utils/prompts'
import { usePromptsStore } from '@/stores/prompts'

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
      primaryAction={{
        label: 'Update visibility',
        onClick: onUpdate,
      }}
      secondaryAction={{
        label: 'Nevermind',
        onClick: () => closeModal(id),
      }}
    >
      <div>
        <span className="text-red-400 font-medium">Warning:</span> Updating the visibility of this prompt will affect
        all users who have access to it.
      </div>
    </ConfirmationModal>
  )
}
