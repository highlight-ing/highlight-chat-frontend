import { ModalObjectProps } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import styles from './modals.module.scss'
import Button from '@/components/Button/Button'
import { usePromptEditor } from '@/hooks/usePromptEditor'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useStore } from '@/providers/store-provider'
import { FormProvider, useForm } from 'react-hook-form'

const CreatePromptModal = ({ id, context }: ModalObjectProps) => {
  const { clearPromptEditorData, setSelectedScreen, needSave, saving, setSaving } = usePromptEditorStore()
  const methods = useForm()
  const { save } = usePromptEditor({ trigger: methods.trigger, formState: methods.formState })
  const closeModal = useStore((state) => state.closeModal)

  useEffect(() => {
    // Create a new prompt
    setSelectedScreen('startWithTemplate')
    clearPromptEditorData()
  }, [])

  async function handleSave() {
    setSaving(true)
    await save()
    setSaving(false)
  }

  return (
    <FormProvider {...methods}>
      <Modal
        id={id}
        size={'fullscreen'}
        bodyClassName={styles.createPromptModal}
        header={
          <div className={'flex w-full items-center justify-between'} style={{ marginRight: '-100px' }}>
            <div className="basis-1/3">
              <CloseButton alignment="left" onClick={() => closeModal(id)} />
            </div>
            <div className="basis-1/3">Create New Highlight App</div>
            <div className="flex basis-1/3 justify-end">
              <Button size={'large'} variant={'tertiary'} onClick={handleSave} disabled={!needSave}>
                Save
              </Button>
            </div>
          </div>
        }
        closeButtonAlignment={'left'}
      >
        <PromptEditor onClose={() => closeModal(id)} />
      </Modal>
    </FormProvider>
  )
}

export default CreatePromptModal
