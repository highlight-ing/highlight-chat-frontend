import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { usePromptEditor } from '@/hooks/usePromptEditor'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { useEffect } from 'react'
import styles from './modals.module.scss'
import Button from '@/components/Button/Button'
import { Prompt } from '@/types/supabase-helpers'

const EditPromptModal = ({ id, context }: ModalObjectProps) => {
  const prompt = context?.prompt as Prompt
  const { setPromptEditorData, setSelectedScreen, needSave, saving, setSaving } = usePromptEditorStore()

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
          <div />
          <span>Edit {prompt.name}</span>
          <Button size={'large'} variant={'tertiary'} onClick={handleSave} disabled={!needSave}>
            Save
          </Button>
        </div>
      }
      closeButtonAlignment={'left'}
    >
      <PromptEditor />
    </Modal>
  )
}

export default EditPromptModal
