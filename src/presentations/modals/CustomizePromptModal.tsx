import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
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

  const preferences = context?.data?.promptShortcutPreferences as any

  const {
    setSelectedApp,
    setAppVisibility,
    setContextTypes,
    setIsInitialPreferencesLoad,
    setPromptEditorData,
    clearPromptEditorData,
  } = usePromptEditorStore()

  const closeModal = useStore((state) => state.closeModal)

  // Set the prompt ID in the editor store so preferences can be saved
  useEffect(() => {
    setPromptEditorData({ externalId: prompt.external_id }, true)
  }, [prompt.external_id, setPromptEditorData])

  // Handle app visibility and context types initialization
  useEffect(() => {
    if (!preferences) {
      setSelectedApp('hidden')
      setAppVisibility({})
      setContextTypes(null)
      setIsInitialPreferencesLoad(false)
      return
    }

    // Handle "all apps" case
    if (preferences.application_name_darwin === '*') {
      setSelectedApp('all')
      setAppVisibility({})
      setContextTypes(
        preferences.context_types ?? {
          selected_text: true,
          audio_transcription: true,
          clipboard_text: true,
          screenshot: true,
          window: true,
        },
      )
      return
    }

    try {
      const apps = JSON.parse(preferences.application_name_darwin || '[]') as string[]
      if (apps.length === 0) {
        setSelectedApp('hidden')
        setAppVisibility({})
        setContextTypes(null)
      } else {
        setSelectedApp('specific')
        const newVisibility: Record<string, boolean> = {}
        apps.forEach((app: string) => {
          newVisibility[app] = true
        })
        setAppVisibility(newVisibility)
        setContextTypes(
          preferences.context_types ?? {
            selected_text: true,
            audio_transcription: true,
            clipboard_text: true,
            screenshot: true,
            window: true,
          },
        )
      }
    } catch (error) {
      console.error('Error parsing app preferences:', error)
      setSelectedApp('hidden')
      setAppVisibility({})
      setContextTypes(null)
    }
    setIsInitialPreferencesLoad(false)
  }, [preferences])

  const onClose = () => {
    clearPromptEditorData()
    closeModal(id)
  }

  return (
    <Modal
      id={id}
      size={'medium'}
      bodyClassName={styles.createPromptModal}
      header={
        <div className={'flex w-2/4 items-center justify-between'}>
          <CloseButton alignment="left" onClick={onClose} />
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
