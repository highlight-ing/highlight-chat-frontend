import variables from '@/variables.module.scss'
import styles from './chathome.module.scss'
import {AddCircle, Setting} from "iconsax-react";
import React, {useEffect, useState} from "react";
import {Prompt} from "@/types/supabase-helpers";
import useAuth from "@/hooks/useAuth";
import {fetchPrompts} from "@/app/(app)/prompts/actions";
import {useStore} from "@/providers/store-provider";
import PromptListRow from "@/components/prompts/PromptListRow";

const ChatHome = ({isShowing}: {isShowing: boolean}) => {
  return (
    <div className={`${styles.chatHomeContainer} ${isShowing ? styles.show : ''}`}>
      <div className={styles.callouts}>
        <Callout
          icon={<Setting color={variables.primary100} variant={"Bold"}/>}
          title={"Play with Highlight"}
          description={"Take Highlight for a spin and learn what it can do."}
          onClick={() => {}}
        />
        <Callout
          icon={<Setting color={variables.green100} variant={"Bold"}/>}
          title={"Explore Apps"}
          description={"Try Highlight apps created by the community."}
          onClick={() => {}}
        />
        <Callout
          icon={<Setting color={variables.pink100} variant={"Bold"}/>}
          title={"Build with Highlight"}
          description={"Make your own Highlight apps and publish them."}
          onClick={() => {}}
        />
      </div>
      <Prompts/>
    </div>
  )
}

export default ChatHome

// Components
const Callout = ({icon, title, description, onClick}: {icon: React.ReactElement, title: string, description: string, onClick: (e: React.MouseEvent) => void}) => {
  return (
    <div className={styles.homeCallout} onClick={onClick}>
      <div className={styles.header}>
        {icon}
        {title}
      </div>
      {description}
    </div>
  )
}


const Prompts = () => {
  const { getAccessToken } = useAuth();
  const { openModal } = useStore((state) => state)
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const loadPrompts = async () => {
      const accessToken = await getAccessToken();
      const response = await fetchPrompts(accessToken);
      if (response.error) {
        return
      }
      setPrompts(response.prompts!.filter((prompt) => prompt.user_id !== response.userId)
        .filter((prompt) => prompt.public) ?? []);
    };

    loadPrompts();
  }, []);

  if (!prompts.length) {
    return null
  }

  return (
    <div className={styles.prompts}>
      {prompts.map((prompt: any) => {
        return (
          <PromptListRow
            key={prompt.slug}
            prompt={prompt}
            type={'prompt'}
          />
        )
      })}
      <div className={styles.baseOption}>
        <div className={styles.baseIcon}>
          <AddCircle color={variables.light40} variant={"Bold"}/>
        </div>
        <div className="flex flex-col mt-0.5">
          <span>Create a Highlight app</span>
        </div>
      </div>
    </div>
  )
}
