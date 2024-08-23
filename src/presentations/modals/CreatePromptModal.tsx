import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import styles from './modals.module.scss'
import Button from '@/components/Button/Button'
import { usePromptEditor } from '@/hooks/usePromptEditor'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useStore } from '@/providers/store-provider'

const CreatePromptModal = ({ id, context }: ModalObjectProps) => {
  const { clearPromptEditorData, setSelectedScreen } = usePromptEditorStore()
  const { save, saveDisabled } = usePromptEditor()
  const closeModal = useStore((state) => state.closeModal)

  useEffect(() => {
    // Create a new prompt
    setSelectedScreen('startWithTemplate')
    clearPromptEditorData()
  }, [])

  return (
    <Modal
      id={id}
      size={'fullscreen'}
      bodyClassName={styles.createPromptModal}
      header={
        <div className={'flex w-full items-center justify-between'}>
          <CloseButton alignment="left" onClick={() => closeModal(id)} />
          <div className="flex grow justify-center">Create New Highlight App</div>
          <div className="absolute right-0 p-2">
            <Button size={'large'} variant={'tertiary'} onClick={save} disabled={saveDisabled}>
              Save
            </Button>
          </div>
        </div>
      }
      closeButtonAlignment={'left'}
    >
      <PromptEditor onClose={() => closeModal(id)} />
    </Modal>
  )
}

export default CreatePromptModal
