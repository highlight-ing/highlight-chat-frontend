import {ModalObjectProps} from "@/types";
import Modal from "@/components/modals/Modal";
import CreatePromptForm from "@/components/prompts/CreatePromptForm/CreatePromptForm";
import {useStore} from "@/providers/store-provider";

const CreatePromptModal = ({id, context}: ModalObjectProps) => {
  const { closeModal } = useStore((state) => ({ closeModal: state.closeModal }))
  return (
    <Modal
      id={id}
      size={'small'}
      header={"Create your prompt"}
    >
      <CreatePromptForm onCreate={() => closeModal(id)}/>
    </Modal>
  )
}

export default CreatePromptModal
