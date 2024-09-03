import { ModalObjectProps } from '@/types'

import { useStore } from '@/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { Prompt } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'
import { addPromptToUser } from '@/utils/prompts'
import usePromptApps from '@/hooks/usePromptApps'
import { trackEvent } from '@/utils/amplitude'

export interface PinPromptModalContext {
  prompt: Prompt
}

export default function PinPromptModal({ id, context }: ModalObjectProps) {
  const { prompt } = context as PinPromptModalContext
  const { getAccessToken } = useAuth()
  const { refreshPrompts } = usePromptApps()

  const addToast = useStore((state) => state.addToast)

  const closeModal = useStore((state) => state.closeModal)

  const onUpdate = async () => {
    const authToken = await getAccessToken()
    const res = await addPromptToUser(prompt.external_id, authToken)

    if (res && res.error) {
      console.error('Error while calling addPromptToUser', res.error)
      return
    }

    refreshPrompts()

    trackEvent('HL Prompt Pinned', {
      prompt_id: prompt.external_id,
    })

    closeModal(id)

    addToast({
      title: 'Prompt pinned',
      description: 'Your prompt has been pinned.',
      type: 'success',
      timeout: 1500,
    })
  }

  return (
    <ConfirmationModal
      id={id}
      header="Unpin prompt"
      primaryAction={{
        label: 'Pin',
        onClick: onUpdate,
        variant: 'success',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => closeModal(id),
      }}
    >
      <div>Pinning this prompt will add it to your pinned prompts.</div>
    </ConfirmationModal>
  )
}
