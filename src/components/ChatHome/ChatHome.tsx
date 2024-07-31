import variables from '@/variables.module.scss'
import styles from './chathome.module.scss'
import {AddCircle, Setting} from "iconsax-react";
import React, {useEffect, useState} from "react";
import {Prompt} from "@/types/supabase-helpers";
import useAuth from "@/hooks/useAuth";
import {fetchPrompts} from "@/utils/prompts";
import {useStore} from "@/providers/store-provider";
import PromptListRow from "@/components/prompts/PromptListRow";
import {Input} from "@/components/Input/Input";
import {HighlightIcon} from "@/icons/icons";

const ChatHome = ({isShowing}: {isShowing: boolean}) => {
  return (
    <div className={`${styles.chatHomeContainer} ${isShowing ? styles.show : ''}`}>
      <div className={styles.input}>
        <InputHeading />
        <Input sticky={false} />
      </div>
      <div className={styles.callouts}>
        {/*<Callout*/}
        {/*  icon={<Setting color={variables.primary100} variant={"Bold"}/>}*/}
        {/*  title={"Play with Highlight"}*/}
        {/*  description={"Take Highlight for a spin and learn what it can do."}*/}
        {/*  onClick={() => {}}*/}
        {/*/>*/}
        <Callout
          icon={<Setting color={variables.green100} variant={"Bold"}/>}
          title={"Explore Apps"}
          description={"Try Highlight apps created by the community."}
          onClick={() => window.open('highlight://appstore', '_blank')}
        />
        <Callout
          icon={<Setting color={variables.pink100} variant={"Bold"}/>}
          title={"Build with Highlight"}
          description={"Make your own Highlight apps and publish them."}
          onClick={() => window.open('https://docs.highlight.ing/documentation/introduction', '_blank')}
        />
      </div>
      <Prompts/>
    </div>
  )
}

export default ChatHome

/**
 * The space above the actual input that shows the Highlight/prompt logo or name.
 */
function InputHeading() {
  const { promptName, promptDescription } = useStore((state) => ({
    promptName: state.promptName,
    promptDescription: state.promptDescription
  }))

  if (!promptName || !promptDescription) {
    return <div className="flex items-center justify-center"><HighlightIcon /></div>
  }

  return (
    <div className="flex flex-col gap-1 text-center">
      <h3 className="text-xl text-light-40">{promptName}</h3>
      <p className="text-light-60">{promptDescription}</p>
    </div>
  )
}

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
            onClick={() => openModal('prompts-modal', {prompt})}
          />
        )
      })}

      <PromptListRow
        // @ts-ignore
        prompt={{slug: 'create', description: 'Create your own prompt'}}
        icon={<AddCircle variant={"Bold"} color={variables.light60}/>}
        type={'official'}
        onClick={() => {}}
      />
    </div>
  )
}
