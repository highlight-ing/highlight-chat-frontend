import { ModalObjectProps } from '@/types'
import { trackEvent } from '@/utils/amplitude'
import { addPromptToUser } from '@/utils/prompts'

import { Prompt } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'
import usePromptApps from '@/hooks/usePromptApps'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { useStore } from '@/components/providers/store-provider'

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
      title: 'Action pinned',
      description: 'Your action has been pinned.',
      type: 'success',
      timeout: 1500,
    })
  }

  return (
    <ConfirmationModal
      id={id}
      header="Pin action"
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
      <div>
        By pinning this action, you'll have quick access to it whenever you summon Highlight. Pinned actions appear
        prominently in your assistant, making them easily accessible for frequent use.
      </div>
    </ConfirmationModal>
  )
}
