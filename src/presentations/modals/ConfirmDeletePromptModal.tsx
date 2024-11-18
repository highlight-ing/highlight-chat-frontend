import { usePromptsStore } from '@/stores/prompts'
import { ModalObjectProps } from '@/types'
import { deletePrompt } from '@/utils/prompts'

import { Prompt } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { useStore } from '@/components/providers/store-provider'

export interface ConfirmDeletePromptModalContext {
  externalId: string
  name: string
}

export default function ConfirmDeletePromptModal({ id, context }: ModalObjectProps) {
  const { externalId, name } = context as ConfirmDeletePromptModalContext
  const { getAccessToken } = useAuth()
  const { removePrompt } = usePromptsStore()
  const addToast = useStore((state) => state.addToast)

  const closeModal = useStore((state) => state.closeModal)

  const onDelete = async () => {
    const authToken = await getAccessToken()
    const res = await deletePrompt(externalId, authToken)

    if (res && res.error) {
      console.error('Error while calling deletePrompt', res.error)
      return
    }

    removePrompt(externalId)

    closeModal(id)
    closeModal('create-prompt')
    closeModal('edit-prompt')

    addToast({
      title: 'Prompt deleted',
      description: 'Your prompt has been deleted.',
      type: 'success',
      timeout: 1500,
    })

    try {
      //@ts-expect-error
      globalThis.highlight.internal.reloadPrompts()
    } catch (err) {
      console.error('Error reloading prompts', err)
    }
  }

  return (
    <ConfirmationModal
      id={id}
      primaryAction={{
        label: 'Delete Forever',
        onClick: onDelete,
      }}
      secondaryAction={{
        label: 'Nevermind',
        onClick: () => closeModal(id),
      }}
    >
      <div>
        <span className="text-red-400 font-medium">Warning:</span> Deleting this prompt cannot be undone.
      </div>
    </ConfirmationModal>
  )
}
