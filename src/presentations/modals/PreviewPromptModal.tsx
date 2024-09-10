import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import styles from './modals.module.scss'
import { Prompt } from '@/types/supabase-helpers'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useStore } from '@/providers/store-provider'
import { PromptShareLinkButton } from '@/components/prompts/PromptCopyPage/PromptShareLinkButton'
import { PromptCopyButton } from '@/components/prompts/PromptCopyPage/PromptCopyButton'
import { PromptCopyDetails } from '@/components/prompts/PromptCopyPage/PromptCopyDetails'

const PreviewPromptModal = ({ id, context }: ModalObjectProps) => {
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
            <PromptShareLinkButton promptSlug={prompt.slug} />
            <PromptCopyButton prompt={prompt} />
          </div>
        </div>
      }
      showClose={false}
    >
      <PromptCopyDetails prompt={prompt} />
    </Modal>
  )
}

export default PreviewPromptModal
