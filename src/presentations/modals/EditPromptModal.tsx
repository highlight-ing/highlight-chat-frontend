import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import { useStore } from '@/providers/store-provider'
import EditPromptForm from '@/components/prompts/EditPromptForm/EditPromptForm'

const EditPromptModal = ({ id, context }: ModalObjectProps) => {
  const closeModal = useStore((state) => state.closeModal)
  return (
    <Modal id={id} size={'small'} header={'Edit your prompt'}>
      <EditPromptForm slug={context?.prompt?.slug} initialData={context?.prompt} onUpdate={() => closeModal(id)} />
    </Modal>
  )
}

export default EditPromptModal
