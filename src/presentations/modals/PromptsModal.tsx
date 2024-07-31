import {ModalObjectProps, PromptApp} from "@/types";
import Modal from "@/components/modals/Modal";
import useAuth from "@/hooks/useAuth";
import {useStore} from "@/providers/store-provider";
import {useEffect, useMemo, useState} from "react";
import {Prompt} from "@/types/supabase-helpers";
import {fetchPrompts, fetchPromptText} from "@/app/(app)/prompts/actions";
import PromptListRow from "@/components/prompts/PromptListRow";
import styles from './modals.module.scss'
import {Divider} from "@/components/catalyst/divider";
import {useRouter} from "next/navigation";

const HighlightChatPrompt = {
  slug: 'hlchat',
  name: 'Highlight Chat',
  description: 'A helpful chat assistant created by Highlight.'
}

const PromptsModal = ({id, context}: ModalObjectProps) => {
  const { getAccessToken } = useAuth();
  const router = useRouter();
  const { closeModal } = useStore((state) => state)
  const [userId, setUserId] = useState<string>()
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const { setPrompt, clearPrompt } = useStore((state) => ({
    setPrompt: state.setPrompt,
    clearPrompt: state.clearPrompt,
  }));

  const communityPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => prompt.user_id !== userId)
      .filter((prompt) => prompt.public)
  }, [prompts, userId]);

  const myPrompts = useMemo(() => {
    return prompts.filter((prompt) => prompt.user_id === userId);
  }, [prompts, userId])

  const selectedPrompt = useMemo(() => {
    return prompts.find(prompt => prompt.id === context?.prompt?.id) ?? context?.prompt
  }, [context, prompts])

  const onClick = async (prompt: PromptApp) => {
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

  useEffect(() => {
    const loadPrompts = async () => {
      const accessToken = await getAccessToken();
      const response = await fetchPrompts(accessToken);
      if (response.error) {
        return
      }
      setUserId(response.userId)
      setPrompts(response.prompts ?? []);
    };

    loadPrompts();
  }, []);

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
            onClick={() => onClick(selectedPrompt)}
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
            onClick={() => onClick(HighlightChatPrompt)}
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
                  onClick={() => onClick(prompt)}
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
