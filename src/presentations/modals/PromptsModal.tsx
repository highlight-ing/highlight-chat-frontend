import React, { useMemo } from 'react'
import { ModalObjectProps } from '@/types'
import variables from '@/variables.module.scss'
import { AddCircle } from 'iconsax-react'
import { useShallow } from 'zustand/react/shallow'

import { Prompt } from '@/types/supabase-helpers'
import usePromptApps from '@/hooks/usePromptApps'
import { Divider } from '@/components/catalyst/divider'
import Modal from '@/components/modals/Modal'
import PromptListRow from '@/components/prompts/PromptListRow'
import { useStore } from '@/components/providers/store-provider'

import styles from './modals.module.scss'

const HighlightChatPrompt = {
  slug: 'hlchat',
  name: 'Highlight Chat',
  description: 'A helpful chat assistant created by Highlight.',
}

const PromptsModal = ({ id, context }: ModalObjectProps) => {
  const { openModal, closeModal } = useStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )
  const { prompts, myPrompts, communityPrompts, selectPrompt } = usePromptApps()

  const selectedPrompt = useMemo(() => {
    return prompts.find((prompt) => prompt.id === context?.prompt?.id) ?? context?.prompt
  }, [context, prompts])

  const onSelectPrompt = async (externalId: string) => {
    await selectPrompt(externalId)
    closeModal(id)
  }

  return (
    <Modal
      id={id}
      size={selectedPrompt ? 'small' : 'medium'}
      header={selectedPrompt ? 'Continue with chat app?' : undefined}
      bodyClassName={selectedPrompt ? undefined : styles.promptsModal}
    >
      {selectedPrompt && (
        <>
          <PromptListRow
            type={myPrompts.some((prompt) => prompt.id === selectedPrompt.id) ? 'self' : 'community'}
            prompt={selectedPrompt}
            onClick={() => onSelectPrompt(selectedPrompt.external_id)}
            isCta={true}
          />
        </>
      )}
      {!selectedPrompt && (
        <>
          <h1>From the Highlight Team</h1>
          <PromptListRow
            type={'official'}
            // @ts-ignore
            prompt={HighlightChatPrompt}
            // @ts-ignore
            onClick={() => onSelectPrompt(HighlightChatPrompt)}
          />
          <Divider style={{ margin: '8px 0 16px 0' }} />
          <h1>My Prompts</h1>
          {myPrompts.map((prompt) => {
            return (
              <PromptListRow
                key={prompt.external_id}
                prompt={prompt}
                type={'self'}
                onClick={() => onSelectPrompt(prompt.external_id)}
                onClickEdit={(e) => openModal('edit-prompt', { prompt })}
              />
            )
          })}
          <PromptListRow
            // @ts-ignore
            prompt={{ slug: 'create', description: 'Create your own chat app' }}
            icon={<AddCircle variant={'Bold'} color={variables.light60} />}
            type={'default'}
            onClick={() => openModal('create-prompt')}
          />
          <Divider style={{ margin: '8px 0 16px 0' }} />
          <h1>Made by the Community</h1>
          {communityPrompts.map((prompt: Prompt) => {
            return (
              <PromptListRow
                key={prompt.external_id}
                type={'community'}
                prompt={prompt}
                onClick={() => onSelectPrompt(prompt.external_id)}
              />
            )
          })}
        </>
      )}
    </Modal>
  )
}

export default PromptsModal
