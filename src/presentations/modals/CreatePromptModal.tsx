import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import styles from './modals.module.scss'

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
      header={'Create New Highlight App'}
      closeButtonAlignment={'left'}
    >
      <PromptEditor />
    </Modal>
  )
}

export default CreatePromptModal
