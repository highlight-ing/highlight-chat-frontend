import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { usePromptEditor } from '@/hooks/usePromptEditor'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { useEffect } from 'react'
import styles from './modals.module.scss'
import Button from '@/components/Button/Button'
import { Prompt } from '@/types/supabase-helpers'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'

const EditPromptModal = ({ id, context }: ModalObjectProps) => {
  const prompt = context?.prompt as Prompt
  const { setPromptEditorData, setSelectedScreen, needSave, saving, setSaving } = usePromptEditorStore()
  const closeModal = useStore((state) => state.closeModal)

  useEffect(() => {
    setSelectedScreen('app')
    setPromptEditorData({
      externalId: prompt.external_id,
      name: prompt.name,
      description: prompt.description ?? undefined,
      appPrompt: prompt.prompt_text ?? undefined,
      suggestionsPrompt: prompt.suggestion_prompt_text ?? undefined,
      visibility: prompt.public ? 'public' : 'private',
      videoUrl: prompt.video_url ?? undefined,
      image: prompt.image ?? undefined,
    })
  }, [prompt])

  const { save } = usePromptEditor()

  async function handleSave() {
    setSaving(true)
    await save()
    setSaving(false)
  }

  return (
    <Modal
      id={id}
      size={'fullscreen'}
      bodyClassName={styles.createPromptModal}
      header={
        <div className={'flex w-full items-center justify-between'} style={{ marginRight: '-100px' }}>
          <div className="basis-1/3">
            <CloseButton alignment="left" onClick={() => closeModal(id)} />
          </div>
          <div className="basis-1/3">Edit {prompt.name}</div>
          <div className="flex basis-1/3 justify-end">
            <Button size={'large'} variant={'tertiary'} onClick={handleSave} disabled={!needSave}>
              Save
            </Button>
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
