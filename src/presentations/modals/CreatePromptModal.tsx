import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import styles from './modals.module.scss'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useStore } from '@/providers/store-provider'
import PromptSaveButton from '@/components/prompts/PromptEditor/PromptSaveButton'

const CreatePromptModal = ({ id, context }: ModalObjectProps) => {
  const { onboarding, promptEditorData, clearPromptEditorData, startTutorial } = usePromptEditorStore()
  const closeModal = useStore((state) => state.closeModal)

  const shouldShowTutorial = !onboarding.hasOnboardedOnceBefore && promptEditorData.externalId === undefined

  useEffect(() => {
    clearPromptEditorData()

    if (shouldShowTutorial) {
      // If the user has not onboarded once before & is making a new prompt, we should show the tutorial
      startTutorial()
    }
  }, [shouldShowTutorial])

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
            <PromptSaveButton />
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
