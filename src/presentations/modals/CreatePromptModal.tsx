import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { ModalObjectProps } from '@/types'

import CloseButton from '@/components/CloseButton/CloseButton'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import PromptSaveButton from '@/components/prompts/PromptEditor/PromptSaveButton'
import { useStore } from '@/components/providers/store-provider'

import styles from './modals.module.scss'

const CreatePromptModal = ({ id, context }: ModalObjectProps) => {
  const { onboarding, promptEditorData, clearPromptEditorData, startTutorial, setSelectedScreen } =
    usePromptEditorStore()
  const closeModal = useStore((state) => state.closeModal)

  const shouldShowTutorial = !onboarding.hasOnboardedOnceBefore && promptEditorData.externalId === undefined

  useEffect(() => {
    setSelectedScreen('simplified-app')
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
          <div className="flex grow justify-center">Create New Action</div>
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
