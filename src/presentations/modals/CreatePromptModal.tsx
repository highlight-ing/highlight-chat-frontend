import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import { useStore } from '@/providers/store-provider'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'

const CreatePromptModal = ({ id, context }: ModalObjectProps) => {
  const closeModal = useStore((state) => state.closeModal)

  const { clearPromptEditorData, setSelectedScreen } = usePromptEditorStore()

  useEffect(() => {
    // Create a new prompt
    setSelectedScreen('startWithTemplate')
    clearPromptEditorData()
  }, [])

  return (
    <Modal id={id} size={'fullscreen'} header={'Create New Highlight App'} closeButtonAlignment={'left'}>
      <PromptEditor />
    </Modal>
  )
}

export default CreatePromptModal
