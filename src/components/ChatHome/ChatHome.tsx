import variables from '@/variables.module.scss'
import styles from './chathome.module.scss'
import mainStyles from '@/main.module.scss'
import {AddCircle, MouseCircle, SearchStatus, Setting} from "iconsax-react";
import React, {useEffect, useState} from "react";
import {useStore} from "@/providers/store-provider";
import PromptListRow from "@/components/prompts/PromptListRow";
import {Input} from "@/components/Input/Input";
import {HighlightIcon} from "@/icons/icons";
import usePromptApps from "@/hooks/usePromptApps";
import Highlight from '@highlight-ai/app-runtime'
import Hotkey from "@/components/Hotkey/Hotkey";
import ExpandableVideo from "@/components/ExpandableVideo/ExpandableVideo";
import {useShallow} from "zustand/react/shallow";
import { trackEvent } from '@/utils/amplitude';

const ChatHome = ({isShowing}: {isShowing: boolean}) => {
  const openModal = useStore((state) => state.openModal)
  const [isVisible, setVisible] = useState(isShowing)

  useEffect(() => {
    if (isShowing) {
      setVisible(true)
      trackEvent('HL Chat Home Viewed', {});
    } else {
      setTimeout(() => {
        setVisible(false)
      }, 500)
      trackEvent('HL Chat Home Hidden', {});
    }
  }, [isShowing])

  return (
    <div className={`${styles.chatHomeContainer} ${isShowing ? styles.show : ''}`}>
      <div className={styles.input}>
        <InputHeading />
        {
          isVisible &&
          <Input sticky={false} />
        }
      </div>
      <div className={styles.callouts}>
        <Callout
          icon={<Setting color={variables.primary100} variant={"Bold"}/>}
          title={"Play with Highlight"}
          description={"Check out what you can do with Highlight Chat."}
          onClick={() => {
            openModal('prompts-modal')
            trackEvent('HL Chat Prompts Modal Opened', {});
          }}
        />
        <Callout
          icon={<Setting color={variables.green100} variant={"Bold"}/>}
          title={"Explore Apps"}
          description={"Try other Highlight apps created by the community."}
          onClick={() => {
            window.open('highlight://appstore', '_blank')
            trackEvent('HL Chat App Store Opened', {});
          }}
        />
        <Callout
          icon={<Setting color={variables.pink100} variant={"Bold"}/>}
          title={"Create Chat Apps"}
          description={"Make your own Highlight Chat apps and publish them."}
          onClick={() => {
            openModal('create-prompt')
            trackEvent('HL Chat Create Prompt Modal Opened', {});
          }}
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
  const { promptName, promptDescription } = useStore(
    useShallow((state) => ({
      promptName: state.promptName,
      promptDescription: state.promptDescription
    }))
  )

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
  const openModal = useStore((state) => state.openModal)
  const { isLoadingPrompts, myPrompts, selectPrompt } = usePromptApps()
  const [hotkey, setHotkey] = useState<string>('alt + .')

  useEffect(() => {
    const fetchHotkey = async () => {
      const hotkey = await Highlight.app.getHotkey()
      setHotkey(hotkey)
      trackEvent('HL Chat Hotkey Fetched', { hotkey });
    }
    fetchHotkey()
  }, [])

  if (isLoadingPrompts) {
    trackEvent('HL Chat Prompts Loading', {});
    return (
      <div className={`${styles.prompts} ${mainStyles.loadingGradient}`}>
        <div className={'w-full h-20 p-16'}/>
      </div>
    )
  }

  if (!myPrompts.length) {
    trackEvent('HL Chat Tutorial Shown', {});
    return <HighlightTutorial hotkey={hotkey}/>
  }

  trackEvent('HL Chat Prompts List Shown', { promptCount: myPrompts.length });
  return (
    <div className={styles.prompts}>
      {myPrompts.map((prompt: any) => {
        return (
          <PromptListRow
            key={prompt.slug}
            prompt={prompt}
            type={'self'}
            onClick={() => {
              selectPrompt(prompt)
              trackEvent('HL Chat Prompt Selected', { promptSlug: prompt.slug });
            }}
          />
        )
      })}

      <PromptListRow
        // @ts-ignore
        prompt={{slug: 'create', description: 'Create your own chat app'}}
        icon={<AddCircle variant={"Bold"} color={variables.light60}/>}
        type={'default'}
        onClick={() => {
          openModal('create-prompt')
          trackEvent('HL Chat Create Prompt From List', {});
        }}
      />
    </div>
  )
}

const HighlightTutorial = ({hotkey}: {hotkey: string}) => {
  return (
    <div className={styles.highlightTutorial}>
      <div className={'flex flex-col gap-3 flex-shrink-0'}>
        <div className={'flex items-center gap-3 text-light-60'}>
          <MouseCircle size={32} variant={'Bold'}/>
          <span>
            Hover the On-Screen Assistant in the top corner of your screen
          </span>
        </div>
        <div className={'flex items-center gap-2'}>
          <div className={'h-px w-full bg-light-10'}/>
          <span className={'text-light-20 text-xs font-medium'}>OR</span>
          <div className={'h-px w-full bg-light-10'}/>
        </div>
        <div className={'flex items-center gap-3 text-light-60'}>
          <SearchStatus size={32} variant={'Bold'}/>
          <div className={'flex items-center gap-1.5'}>Press <Hotkey hotkey={hotkey}/> to Highlight what's on your screen</div>
        </div>
      </div>
      <ExpandableVideo
        src={'https://cdn.highlight.ing/media/examples/FloatyExample.mp4#t=0.1'}
        style={{
          maxWidth: '148px',
        }}
        onPlay={() => trackEvent('HL Chat Tutorial Video Played', {})}
      />
    </div>
  )
}