import Modal from '@/components/modals/Modal'
import { ChatHistoryItem, ModalObjectProps } from '@/types'

import styles from './modals.module.scss'
import Button from '@/components/Button/Button'
import { useApi } from '@/hooks/useApi'
import { useChatHistory } from '@/hooks/useChatHistory'
import { useStore } from '@/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { useShallow } from 'zustand/react/shallow'

const DeleteChatModal = ({ id, context }: ModalObjectProps) => {
  const chat = context as ChatHistoryItem
  const { deleteRequest } = useApi()
  const { refreshChatHistory } = useChatHistory()
  const { conversationId, startNewConversation, closeModal, removeOpenConversation, clearOpenConversationMessages } =
    useStore(
      useShallow((state) => ({
        conversationId: state.conversationId,
        startNewConversation: state.startNewConversation,
        closeModal: state.closeModal,
        removeOpenConversation: state.removeOpenConversation,
        clearOpenConversationMessages: state.clearOpenConversationMessages,
      })),
    )

  const onDelete = async () => {
    const response = await deleteRequest(`history/${chat.id}`)
    if (!response.ok) {
      // @TODO Error handling
      console.error('Failed to delete')
      return
    }
    if (chat.id === conversationId) {
      startNewConversation()
    }
    removeOpenConversation(chat.id)
    clearOpenConversationMessages(chat.id)
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
        <span className="font-medium text-red-400">Warning:</span> Deleting this chat cannot be undone:
      </div>
      <div className="font-medium">{chat.title}</div>
    </ConfirmationModal>
  )
}

export default DeleteChatModal
