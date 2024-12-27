import { useEffect, useRef, useState } from 'react'
import { DEFAULT_SYSTEM_PROMPT, usePromptEditorStore } from '@/stores/prompt-editor'
import { ModalObjectProps, PromptTag } from '@/types'

import { Prompt } from '@/types/supabase-helpers'
import { PreferredAttachmentSchema } from '@/lib/zod'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import PromptSaveButton from '@/components/prompts/PromptEditor/PromptSaveButton'
import { useStore } from '@/components/providers/store-provider'

import styles from './modals.module.scss'

interface AppVisibility {
  [key: string]: boolean
}

const EditPromptModal = ({ id, context }: ModalObjectProps) => {
  const prompt = context?.data.prompt as Prompt
  const preferences = context?.data.promptShortcutPreferences as any

  const {
    setPromptEditorData,
    setSelectedScreen,
    setSettingsHasNoErrors,
    setSelectedApp,
    setAppVisibility,
    setContextTypes,
    setIsInitialPreferencesLoad,
  } = usePromptEditorStore()

  const closeModal = useStore((state) => state.closeModal)

  const isInitializing = useRef(true)


  // Handle app visibility and context types initialization
  useEffect(() => {
    if (!isInitializing.current) {
      setIsInitialPreferencesLoad(true)
    }

    if (!preferences) {
      // No preferences found - set to hidden state
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
      // Parse the JSON array of apps
      const apps = JSON.parse(preferences.application_name_darwin || '[]') as string[]

      if (apps.length === 0) {
        // Empty apps array - set to hidden state
        setSelectedApp('hidden')
        setAppVisibility({})
        setContextTypes(null)
      } else {
        // Specific apps selected
        setSelectedApp('specific')
        const newVisibility: AppVisibility = {}
        apps.forEach((app: string) => {
          newVisibility[app] = true
        })
        setAppVisibility(newVisibility)

        // Use context types from preferences if they exist
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
      // Error case - set to hidden state
      setSelectedApp('hidden')
      setAppVisibility({})
      setContextTypes(null)
    }
    setIsInitialPreferencesLoad(false) 

  }, [preferences])

  // Initialize prompt editor data
  useEffect(() => {
    setSelectedScreen('app')
    setPromptEditorData(
      {
        externalId: prompt.external_id,
        slug: prompt.slug ?? undefined,
        name: prompt.name,
        description: prompt.description ?? undefined,
        appPrompt: prompt.prompt_text ?? undefined,
        visibility: prompt.public ? 'public' : 'private',
        videoUrl: prompt.video_url ?? undefined,
        image: prompt.image ? `${prompt.image}.${prompt.user_images?.file_extension}` : undefined,
        // @ts-ignore
        tags: prompt.tags as PromptTag[],
        systemPrompt: prompt.system_prompt ?? DEFAULT_SYSTEM_PROMPT,
        preferredAttachment: PreferredAttachmentSchema.nullish().parse(prompt.preferred_attachment) ?? 'default',
        enabledAutomations: {
          createLinearIssue: prompt.linear_integration_enabled ?? false,
          createNotionPage: prompt.create_notion_page_integration_enabled ?? false,
        },
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
          <div className="absolute right-0 flex gap-1 p-2">
            <ShareLinkButton />
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

function ShareLinkButton() {
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const { promptEditorData } = usePromptEditorStore()

  const slug = promptEditorData.slug

  const url = `https://chat.highlight.ing/prompts/${slug}`

  const [copied, setCopied] = useState(false)

  function onCopyLinkClick() {
    if (copied) {
      return
    }

    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    navigator.clipboard.writeText(url)
    setCopied(true)

    timeout.current = setTimeout(() => {
      setCopied(false)
    }, 2500)
  }

  return (
    <Button onClick={onCopyLinkClick} size={'large'} variant={'ghost'} style={{ marginRight: '6px' }} disabled={!slug}>
      {copied ? 'Copied link to clipboard!' : 'Share'}
    </Button>
  )
}

export default EditPromptModal
