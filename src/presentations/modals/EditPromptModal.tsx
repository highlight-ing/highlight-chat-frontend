import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { useEffect } from 'react'
import styles from './modals.module.scss'
import { Prompt } from '@/types/supabase-helpers'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useStore } from '@/providers/store-provider'
import PromptSaveButton from '@/components/prompts/PromptEditor/PromptSaveButton'
import { PromptTag } from '@/types'
const EditPromptModal = ({ id, context }: ModalObjectProps) => {
  const prompt = context?.prompt as Prompt

  const { setPromptEditorData, setSelectedScreen, setSettingsHasNoErrors } = usePromptEditorStore()
  const closeModal = useStore((state) => state.closeModal)

  useEffect(() => {
    setSelectedScreen('app')
    setPromptEditorData(
      {
        externalId: prompt.external_id,
        slug: prompt.slug ?? undefined,
        name: prompt.name,
        description: prompt.description ?? undefined,
        appPrompt: prompt.prompt_text ?? undefined,
        suggestionsPrompt: prompt.suggestion_prompt_text ?? undefined,
        visibility: prompt.public ? 'public' : 'private',
        videoUrl: prompt.video_url ?? undefined,
        image: prompt.image ? `${prompt.image}.${prompt.user_images?.file_extension}` : undefined,
        tags: prompt.tags as PromptTag[],
      },
      true,
    )
    setSettingsHasNoErrors(true)
  }, [prompt])

  return (
    <Modal
      id={id}
      size={'fullscreen'}
      bodyClassName={styles.createPromptModal}
      header={
        <div className={'flex w-full items-center justify-between'}>
          <CloseButton alignment="left" onClick={() => closeModal(id)} />
          <div className="flex grow justify-center">Edit {prompt.name}</div>
          <div className="absolute right-0 p-2">
            <PromptSaveButton />
          </div>
        </div>
      }
      showClose={false}
    >
      <PromptEditor onClose={() => closeModal(id)} />
    </Modal>
  )
}

export default EditPromptModal
