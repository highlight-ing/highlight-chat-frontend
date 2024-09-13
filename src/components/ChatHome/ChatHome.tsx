import variables from '@/variables.module.scss'
import styles from './chathome.module.scss'
import mainStyles from '@/main.module.scss'
import { AddCircle, MouseCircle, SearchStatus, Setting } from 'iconsax-react'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/providers/store-provider'
import PromptListRow from '@/components/prompts/PromptListRow'
import { Input } from '@/components/Input/Input'
import { HighlightIcon } from '@/icons/icons'
import usePromptApps from '@/hooks/usePromptApps'
import Highlight from '@highlight-ai/app-runtime'
import Hotkey from '@/components/Hotkey/Hotkey'
import ExpandableVideo from '@/components/ExpandableVideo/ExpandableVideo'
import { useShallow } from 'zustand/react/shallow'
import { Prompt } from '@/types/supabase-helpers'
import { trackEvent } from '@/utils/amplitude'
import PersonalPrompts from '@/components/PersonalPrompts/PersonalPrompts'
import TrendingPrompts from '@/components/TrendingPrompts/TrendingPrompts'
import ConversationsHome from '@/components/Conversations/ConversationsHome'
import ConversationsActive from '@/components/Conversations/ConversationsActive'
import AudioTranscriptionComponent from '@/components/Conversations/AudioTranscriptionComponent'
import { ConversationProvider } from '@/context/ConversationContext'
import { ConversationsSettingsProvider } from '@/context/ConversationSettingsContext'

const ChatHome = ({ isShowing }: { isShowing: boolean }) => {
  const [isVisible, setVisible] = useState(isShowing)

  // Get the user ID from the store
  const userId = useStore((state) => state.userId)

  useEffect(() => {
    if (isShowing) {
      setVisible(true)
      trackEvent('HL Chat Home Viewed', {})
    } else {
      setTimeout(() => {
        setVisible(false)
      }, 300)
      trackEvent('HL Chat Home Hidden', {})
    }
  }, [isShowing])

  return (
    <div className={`${styles.chatHomeContainer} ${isShowing ? styles.show : ''}`}>
      <div className={styles.input}>
        <InputHeading />
        {isVisible && <Input isActiveChat={false} />}
      </div>
      <ConversationsSettingsProvider>
        <ConversationProvider>
          <AudioTranscriptionComponent />
        </ConversationProvider>
      </ConversationsSettingsProvider>
      <Prompts userId={userId} />
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
      promptDescription: state.promptDescription,
    })),
  )

  if (!promptName || !promptDescription) {
    return (
      <div className="flex items-center justify-center">
        <HighlightIcon />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 text-center">
      <h3 className="text-xl text-light-40">{promptName}</h3>
      <p className="text-light-60">{promptDescription}</p>
    </div>
  )
}

const Prompts = ({ userId }: { userId: string | undefined }) => {
  const { isLoadingPrompts, myPrompts, communityPrompts, pinnedPrompts } = usePromptApps()
  if (isLoadingPrompts && !userId) {
    return (
      <div className="flex flex-col gap-4">
        <div className={`${styles.prompts} ${mainStyles.loadingGradient} w-full`}>
          <div className={'h-24 w-full p-16'} />
        </div>
        <div className={`${styles.prompts} ${mainStyles.loadingGradient} w-full`}>
          <div className={'h-96 w-full p-16'} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.callouts}>
        <PersonalPrompts userId={userId} prompts={myPrompts} pinnedPrompts={pinnedPrompts} />
      </div>
      <div className={styles.callouts}>
        <TrendingPrompts userId={userId} prompts={communityPrompts} pinnedPrompts={pinnedPrompts} />
      </div>
    </>
  )
}

const HighlightTutorial = ({ hotkey }: { hotkey: string }) => {
  return (
    <div className={styles.highlightTutorial}>
      <div className={'flex flex-shrink-0 flex-col gap-3'}>
        <div className={'flex items-center gap-3 text-light-60'}>
          <MouseCircle size={32} variant={'Bold'} />
          <span>Hover the On-Screen Assistant in the top corner of your screen</span>
        </div>
        <div className={'flex items-center gap-2'}>
          <div className={'h-px w-full bg-light-10'} />
          <span className={'text-xs font-medium text-light-20'}>OR</span>
          <div className={'h-px w-full bg-light-10'} />
        </div>
        <div className={'flex items-center gap-3 text-light-60'}>
          <SearchStatus size={32} variant={'Bold'} />
          <div className={'flex items-center gap-1.5'}>
            Press <Hotkey hotkey={hotkey} /> to Highlight what's on your screen
          </div>
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

// Components
const Callout = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactElement
  title: string
  description: string
  onClick: (e: React.MouseEvent) => void
}) => {
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
