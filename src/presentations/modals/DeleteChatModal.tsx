import { ChatHistoryItem, ModalObjectProps } from '@/types'
import { useShallow } from 'zustand/react/shallow'

import { useApi } from '@/hooks/useApi'
import { useChatHistory } from '@/hooks/useChatHistory'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { useStore } from '@/components/providers/store-provider'

const DeleteChatModal = ({ id, context }: ModalObjectProps) => {
  const chat = context as ChatHistoryItem
  const { deleteRequest } = useApi()
  const { refreshChatHistory } = useChatHistory()
  const { conversationId, startNewConversation, closeModal, removeOpenConversation, clearConversationMessages } =
    useStore(
      useShallow((state) => ({
        conversationId: state.conversationId,
        startNewConversation: state.startNewConversation,
        closeModal: state.closeModal,
        removeOpenConversation: state.removeOpenConversation,
        clearConversationMessages: state.clearConversationMessages,
      })),
    )

  const onDelete = async () => {
    const response = await deleteRequest(`history/${chat?.id}`, { version: 'v3' })
    if (!response.ok) {
      // @TODO Error handling
      console.error('Failed to delete')
      return
    }
    if (chat?.id === conversationId) {
      startNewConversation()
    }
    removeOpenConversation(chat?.id)
    await refreshChatHistory()
    closeModal(id)
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
        <span className="text-red-400 font-medium">Warning:</span> Deleting this chat cannot be undone:
      </div>
      <div className="font-medium">{chat.title}</div>
    </ConfirmationModal>
  )
}

export default DeleteChatModal
