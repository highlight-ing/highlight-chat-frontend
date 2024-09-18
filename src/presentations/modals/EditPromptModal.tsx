import { ModalObjectProps, PromptTag } from '@/types'
import Modal from '@/components/modals/Modal'
import PromptEditor from '@/components/prompts/PromptEditor/PromptEditor'
import { DEFAULT_SYSTEM_PROMPT, usePromptEditorStore } from '@/stores/prompt-editor'
import { useEffect, useRef, useState } from 'react'
import styles from './modals.module.scss'
import { Prompt } from '@/types/supabase-helpers'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useStore } from '@/providers/store-provider'
import PromptSaveButton from '@/components/prompts/PromptEditor/PromptSaveButton'
import Button from '@/components/Button/Button'
import { PreferredAttachmentSchema } from '@/lib/zod'

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
        visibility: prompt.public ? 'public' : 'private',
        videoUrl: prompt.video_url ?? undefined,
        image: prompt.image ? `${prompt.image}.${prompt.user_images?.file_extension}` : undefined,
        // @ts-ignore
        tags: prompt.tags as PromptTag[],
        systemPrompt: prompt.system_prompt ?? DEFAULT_SYSTEM_PROMPT,
        preferredAttachment: PreferredAttachmentSchema.nullish().parse(prompt.preferred_attachment) ?? 'default',
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

export default EditPromptModal

function ShareLinkButton() {
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const { promptEditorData } = usePromptEditorStore()

  const slug = promptEditorData.slug

  // const host = window.location.protocol + '//' + window.location.host
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
