import {ModalObjectProps, PromptProps} from "@/types";
import Modal from "@/components/modals/Modal";
import useAuth from "@/hooks/useAuth";
import {useStore} from "@/providers/store-provider";
import {useEffect, useMemo, useState} from "react";
import {Prompt} from "@/types/supabase-helpers";
import {fetchPrompts} from "@/app/(app)/prompts/actions";
import PromptListRow from "@/components/prompts/PromptListRow";
import styles from './modals.module.scss'
import {Divider} from "@/components/catalyst/divider";

const PromptsModal = ({id, context}: ModalObjectProps) => {
  const { getAccessToken } = useAuth();
  const [userId, setUserId] = useState<string>()
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const communityPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => prompt.user_id !== userId)
      .filter((prompt) => prompt.public)
  }, [prompts, userId]);

  const myPrompts = useMemo(() => {
    return prompts.filter((prompt) => prompt.user_id === userId);
  }, [prompts, userId])

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
    <Modal id={id} size={'medium'} bodyClassName={styles.promptsModal}>
      <h1>From the Highlight Team</h1>
      <PromptListRow
        type={'official'}
        // @ts-ignore
        prompt={{slug: 'hlchat', name: 'Highlight Chat', description: 'A helpful chat assistant created by Highlight.'}}
      />
      <Divider style={{margin: '8px 0 16px 0'}}/>
      <h1>Made by the Community</h1>
      {
        communityPrompts.map((prompt: PromptProps) => {
          return (
            <PromptListRow
              key={prompt.slug}
              type={'prompt'}
              prompt={prompt}
            />
          )
        })
      }
    </Modal>
  )
}

export default PromptsModal
