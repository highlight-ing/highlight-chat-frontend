import { ModalObjectProps } from '@/types'

import { useStore } from '@/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { Prompt } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'
import { removePromptFromUser } from '@/utils/prompts'
import usePromptApps from '@/hooks/usePromptApps'
import Highlight from '@highlight-ai/app-runtime'

export interface UnpinPromptModalContext {
  prompt: Prompt
}

export default function UnpinPromptModal({ id, context }: ModalObjectProps) {
  const { prompt } = context as UnpinPromptModalContext
  const { getAccessToken } = useAuth()
  const { refreshPrompts } = usePromptApps()

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
    refreshPrompts()

    closeModal(id)

    addToast({
      title: 'Prompt unpinned',
      description: 'Your prompt has been unpinned.',
      type: 'success',
      timeout: 1500,
    })
  }

  return (
    <ConfirmationModal
      id={id}
      header="Unpin prompt"
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
      <div>Unpinning this prompt will remove it from your pinned prompts.</div>
    </ConfirmationModal>
  )
}
