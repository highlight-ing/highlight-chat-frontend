import Modal from "@/components/modals/Modal";
import {ChatHistoryItem, ModalObjectProps} from "@/types";

import styles from './modals.module.scss'
import Button from "@/components/Button/Button";

const DeleteChatModal = ({id, context}: ModalObjectProps) => {
  const chat = context as ChatHistoryItem
  return (
    <Modal id={id} size={'small'} header={'Are you sure?'} bodyClassName={styles.deleteChat}>
      <span><span className="text-red-400 font-medium">Warning:</span> Deleting this chat cannot be undone:</span>
      <span className="font-medium">{chat.title}</span>
      <Button size={'medium'} variant={'secondary'}>
        Delete
      </Button>
    </Modal>
  )
}

export default DeleteChatModal
