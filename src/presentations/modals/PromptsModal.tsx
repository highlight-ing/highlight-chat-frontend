import {ModalObjectProps, PromptApp} from "@/types";
import Modal from "@/components/modals/Modal";
import {useStore} from "@/providers/store-provider";
import React, {useMemo} from "react";
import {fetchPromptText} from "@/utils/prompts";
import PromptListRow from "@/components/prompts/PromptListRow";
import styles from './modals.module.scss'
import {Divider} from "@/components/catalyst/divider";
import {useRouter} from "next/navigation";
import {AddCircle} from "iconsax-react";
import variables from "@/variables.module.scss";
import usePromptApps from "@/hooks/usePromptApps";

const HighlightChatPrompt = {
  slug: 'hlchat',
  name: 'Highlight Chat',
  description: 'A helpful chat assistant created by Highlight.'
}

const PromptsModal = ({id, context}: ModalObjectProps) => {
  const router = useRouter();
  const { openModal, closeModal } = useStore((state) => ({
    openModal: state.openModal,
    closeModal: state.closeModal
  }))
  const { prompts, myPrompts, communityPrompts, selectPrompt } = usePromptApps()

  const { setPrompt, clearPrompt } = useStore((state) => ({
    setPrompt: state.setPrompt,
    clearPrompt: state.clearPrompt,
  }));

  const selectedPrompt = useMemo(() => {
    return prompts.find(prompt => prompt.id === context?.prompt?.id) ?? context?.prompt
  }, [context, prompts])

  const onSelectPrompt = async (prompt: PromptApp) => {
    await selectPrompt(prompt)
    closeModal(id)
  };

  return (
    <Modal
      id={id}
      size={selectedPrompt ? 'small' : 'medium'}
      header={selectedPrompt ? 'Continue with chat app?' : undefined}
      bodyClassName={selectedPrompt ? undefined : styles.promptsModal}
    >
      {
        selectedPrompt &&
        <>
          <PromptListRow
            type={myPrompts.some(prompt => prompt.id === selectedPrompt.id) ? 'self' : 'community'}
            prompt={selectedPrompt}
            onClick={() => onSelectPrompt(selectedPrompt)}
            isCta={true}
          />
        </>
      }
      {
        !selectedPrompt &&
        <>
          <h1>From the Highlight Team</h1>
          <PromptListRow
            type={'official'}
            // @ts-ignore
            prompt={HighlightChatPrompt}
            // @ts-ignore
            onClick={() => onSelectPrompt(HighlightChatPrompt)}
          />
          <Divider style={{margin: '8px 0 16px 0'}}/>
          <h1>My Prompts</h1>
          {
            myPrompts.map(prompt => {
              return (
                <PromptListRow
                  key={prompt.slug}
                  prompt={prompt}
                  type={'self'}
                  onClick={() => onSelectPrompt(prompt)}
                  onClickEdit={(e) => openModal('edit-prompt', {prompt})}
                />
              )
            })
          }
          <PromptListRow
            // @ts-ignore
            prompt={{slug: 'create', description: 'Create your own chat app'}}
            icon={<AddCircle variant={"Bold"} color={variables.light60}/>}
            type={'default'}
            onClick={() => openModal('create-prompt')}
          />
          <Divider style={{margin: '8px 0 16px 0'}}/>
          <h1>Made by the Community</h1>
          {
            communityPrompts.map((prompt: PromptApp) => {
              return (
                <PromptListRow
                  key={prompt.slug}
                  type={'community'}
                  prompt={prompt}
                  onClick={() => onSelectPrompt(prompt)}
                />
              )
            })
          }
        </>
      }
    </Modal>
  )
}

export default PromptsModal
