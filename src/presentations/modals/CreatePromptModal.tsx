import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import styles from './modals.module.scss'
import Button from "@/components/Button/Button";

const CreatePromptModal = ({ id, context }: ModalObjectProps) => {
  const { clearPromptEditorData, setSelectedScreen } = usePromptEditorStore()

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
        <div className={'flex items-center w-full justify-between'} style={{marginRight: '-100px'}}>
          <div/>
          <span>Create New Highlight App</span>
          <Button size={'large'} variant={'tertiary'} disabled={true}>
            Create App
          </Button>
        </div>
      }
      closeButtonAlignment={'left'}
    >
      <PromptEditor />
    </Modal>
  )
}

export default CreatePromptModal
