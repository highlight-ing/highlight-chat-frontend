import { ModalObjectProps } from '@/types'

import { Prompt } from '@/types/supabase-helpers'
import CloseButton from '@/components/CloseButton/CloseButton'
import Modal from '@/components/modals/Modal'
import { CustomizePromptButton } from '@/components/prompts/CustomizePromptPage/CustomizePromptButton'
import { CustomizePromptDetails } from '@/components/prompts/CustomizePromptPage/CustomizePromptDetails'
import { useStore } from '@/components/providers/store-provider'

import styles from './modals.module.scss'

const CustomizePromptModal = ({ id, context }: ModalObjectProps) => {
  const prompt = context?.prompt as Prompt

  const closeModal = useStore((state) => state.closeModal)

  return (
    <Modal
      id={id}
      size={'medium'}
      bodyClassName={styles.createPromptModal}
      header={
        <div className={'flex w-2/4 items-center justify-between'}>
          <CloseButton alignment="left" onClick={() => closeModal(id)} />
          <div className="flex grow justify-center">{prompt.name}</div>
          <div className="absolute right-0 flex gap-1 p-2">
            <CustomizePromptButton prompt={prompt} />
          </div>
        </div>
      }
      showClose={false}
    >
      <CustomizePromptDetails prompt={prompt} />
    </Modal>
  )
}

export default CustomizePromptModal
