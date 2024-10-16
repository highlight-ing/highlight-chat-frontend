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
  const { pinPrompt } = usePinPromptAction()

  const closeModal = useStore((state) => state.closeModal)

  const onUpdate = async () => {
    pinPrompt(prompt)
    closeModal(id)
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
      doNotShowAgainOption={true}
    >
      <div>Pinned actions appear prominently in your assistant, accessible each time you summon Highlight.</div>
    </ConfirmationModal>
  )
}

export const usePinPromptAction = () => {
  const { getAccessToken } = useAuth()
  const { refreshPrompts } = usePromptApps()
  const addToast = useStore((state) => state.addToast)

  const pinPrompt = async (prompt: Prompt) => {
    const authToken = await getAccessToken()
    const res = await addPromptToUser(prompt.external_id, authToken)

    if (res && res.error) {
      console.error('Error while calling addPromptToUser', res.error)
      return false
    }

    refreshPrompts()

    trackEvent('HL Prompt Pinned', {
      prompt_id: prompt.external_id,
    })

    addToast({
      title: 'Action pinned',
      description: 'Your action has been pinned.',
      type: 'success',
      timeout: 1500,
    })

    // @ts-ignore
    await globalThis.highlight.internal.reloadPrompts()
    // @ts-ignore
    globalThis.highlight.internal.openPrompt(prompt.slug)
  }

  return { pinPrompt }
}
