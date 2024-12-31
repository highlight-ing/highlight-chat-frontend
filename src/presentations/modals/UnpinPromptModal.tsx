import { ModalObjectProps } from '@/types'
import Highlight from '@highlight-ai/app-runtime'

import { Prompt } from '@/types/supabase-helpers'
import { trackEvent } from '@/utils/amplitude'
import { removePromptFromUser } from '@/utils/prompts'
import useAuth from '@/hooks/useAuth'
import usePromptApps from '@/hooks/usePromptApps'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { useStore } from '@/components/providers/store-provider'

export interface UnpinPromptModalContext {
  prompt: Prompt
}

export default function UnpinPromptModal({ id, context }: ModalObjectProps) {
  const { prompt } = context as UnpinPromptModalContext
  const { getAccessToken } = useAuth()
  const { refreshPinnedPrompts } = usePromptApps()

  const addToast = useStore((state) => state.addToast)

  const closeModal = useStore((state) => state.closeModal)

  const onUpdate = async () => {
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

    closeModal(id)

    addToast({
      title: 'Action unpinned',
      description: 'Your action has been unpinned.',
      type: 'success',
      timeout: 1500,
    })
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
    >
      <div>Unpinning this action will remove it from your pinned actions.</div>
    </ConfirmationModal>
  )
}
