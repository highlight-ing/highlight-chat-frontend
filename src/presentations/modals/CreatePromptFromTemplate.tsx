import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import styles from './modals.module.scss'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useStore } from '@/providers/store-provider'
import PromptSaveButton from '@/components/prompts/PromptEditor/PromptSaveButton'

const CreatePromptFromTemplateModal = ({ id, context }: ModalObjectProps) => {
  const { clearPromptEditorData, setSelectedScreen } = usePromptEditorStore()
  const closeModal = useStore((state) => state.closeModal)

  const handleClose = () => {
    closeModal(id)
    clearPromptEditorData()
  }

  useEffect(() => {
    setSelectedScreen('app')
  }, [])

  return (
    <Modal
      id={id}
      size={'fullscreen'}
      bodyClassName={styles.createPromptModal}
      header={
        <div className={'flex w-full items-center justify-between'}>
          <CloseButton alignment="left" onClick={handleClose} />
          <div className="flex grow justify-center">Create Action from Template</div>
          <div className="absolute right-0 p-2">
            <PromptSaveButton />
          </div>
        </div>
      }
      closeButtonAlignment={'left'}
    >
      <PromptEditor onClose={handleClose} />
    </Modal>
  )
}

export default CreatePromptFromTemplateModal
