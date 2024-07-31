import {ModalObjectProps, PromptApp} from "@/types";
import Modal from "@/components/modals/Modal";
import useAuth from "@/hooks/useAuth";
import {useStore} from "@/providers/store-provider";
import React, {useEffect, useMemo, useState} from "react";
import {Prompt} from "@/types/supabase-helpers";
import {fetchPrompts, fetchPromptText} from "@/utils/prompts";
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
  const { prompts, myPrompts, communityPrompts } = usePromptApps()

  const { setPrompt, clearPrompt } = useStore((state) => ({
    setPrompt: state.setPrompt,
    clearPrompt: state.clearPrompt,
  }));

  const selectedPrompt = useMemo(() => {
    return prompts.find(prompt => prompt.id === context?.prompt?.id) ?? context?.prompt
  }, [context, prompts])

  const onSelectPrompt = async (prompt: PromptApp) => {
    if (prompt.slug === 'hlchat') {
      clearPrompt();
      router.push("/");
      closeModal(id)
      return;
    }

    // Fetch the prompt
    const text = await fetchPromptText(prompt.slug!);

    setPrompt({
      promptName: prompt.name,
      promptDescription: prompt.description!,
      promptAppName: prompt.slug!,
      prompt: text,
    });

    router.push(`/`);
    closeModal(id)
  };

  return (
    <Modal
      id={id}
      size={selectedPrompt ? 'small' : 'medium'}
      header={selectedPrompt ? 'Continue with prompt?' : undefined}
      bodyClassName={selectedPrompt ? undefined : styles.promptsModal}
    >
      {
        selectedPrompt &&
        <>
          <PromptListRow
            type={'prompt'}
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
                  type={'prompt'}
                  onClick={() => onSelectPrompt(prompt)}
                  onClickEdit={(e) => openModal('edit-prompt', {prompt})}
                />
              )
            })
          }
          <PromptListRow
            // @ts-ignore
            prompt={{slug: 'create', description: 'Create your own prompt'}}
            icon={<AddCircle variant={"Bold"} color={variables.light60}/>}
            type={'official'}
            onClick={() => openModal('create-prompt')}
          />
          <Divider style={{margin: '8px 0 16px 0'}}/>
          <h1>Made by the Community</h1>
          {
            communityPrompts.map((prompt: PromptApp) => {
              return (
                <PromptListRow
                  key={prompt.slug}
                  type={'prompt'}
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
