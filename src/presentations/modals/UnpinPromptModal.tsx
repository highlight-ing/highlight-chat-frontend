import { ModalObjectProps } from '@/types'

import { useStore } from '@/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { Prompt } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'
import { removePromptFromUser } from '@/utils/prompts'
import usePromptApps from '@/hooks/usePromptApps'
import { trackEvent } from '@/utils/amplitude'
import Highlight from '@highlight-ai/app-runtime'

export interface UnpinPromptModalContext {
  prompt: Prompt
}

export default function UnpinPromptModal({ id, context }: ModalObjectProps) {
  const { prompt } = context as UnpinPromptModalContext
  const { unpinPrompt } = useUnpinPromptAction()
  const closeModal = useStore((state) => state.closeModal)

  const onUpdate = async () => {
    unpinPrompt(prompt)
    closeModal(id)
  }

  return (
    <ConfirmationModal
      id={id}
      header="Unpin action"
      primaryAction={{
        label: 'Unpin',
        onClick: onUpdate,
        variant: 'success',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => closeModal(id),
      }}
      doNotShowAgainOption={true}
    >
      <div>Unpinning this action will remove it from your pinned actions.</div>
    </ConfirmationModal>
  )
}

export const useUnpinPromptAction = () => {
  const { getAccessToken } = useAuth()
  const { refreshPinnedPrompts } = usePromptApps()

  const addToast = useStore((state) => state.addToast)

  const unpinPrompt = async (prompt: Prompt) => {
    const authToken = await getAccessToken()
    const res = await removePromptFromUser(prompt.external_id, authToken)

    if (res && res.error) {
      console.error('Error while calling removePromptFromUser', res.error)
      return
    }

    Highlight.appStorage.delete(`ctas.promptAdded.${prompt.external_id}`)
    refreshPinnedPrompts()

    trackEvent('HL Prompt Unpinned', {
      prompt_id: prompt.external_id,
    })

    addToast({
      title: 'Action unpinned',
      description: 'Your action has been unpinned.',
      type: 'success',
      timeout: 1500,
    })

    // @ts-ignore
    globalThis.highlight.internal.reloadPrompts()
  }

  return {
    unpinPrompt,
  }
}
