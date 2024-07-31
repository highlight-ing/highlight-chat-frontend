import Modal from "@/components/modals/Modal";
import {ChatHistoryItem, ModalObjectProps} from "@/types";

import styles from './modals.module.scss'
import Button from "@/components/Button/Button";
import {useApi} from "@/hooks/useApi";
import {useChatHistory} from "@/hooks/useChatHistory";
import {useStore} from "@/providers/store-provider";

const DeleteChatModal = ({id, context}: ModalObjectProps) => {
  const chat = context as ChatHistoryItem
  const {deleteRequest} = useApi()
  const {refreshChatHistory} = useChatHistory();
  const {conversationId, startNewConversation, closeModal} = useStore((state) => state);

  const onDelete = async () => {
    // console.log("Deleting chat", chat)
    // const response = await deleteRequest(`history/${chat.id}`)
    // if (!response.ok) {
    //   // @TODO Error handling
    //   console.error('Failed to delete')
    //   return
    // }
    // if (chat.id === conversationId) {
    //   startNewConversation()
    // }
    // await refreshChatHistory()
    // closeModal(id)
  }

  return (
    <Modal id={id} size={'small'} header={'Are you sure?'} bodyClassName={styles.deleteChat}>
      <div className="flex flex-col items-center gap-1">
        <div><span className="text-red-400 font-medium">Warning:</span> Deleting this chat cannot be undone:</div>
        <div className="font-medium">{chat.title}</div>
      </div>
      <Button size={'medium'} variant={'danger'} onClick={onDelete}>
        Delete Forever
      </Button>
    </Modal>
  )
}

export default DeleteChatModal
