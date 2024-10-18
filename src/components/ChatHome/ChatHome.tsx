import styles from './chathome.module.scss'
import mainStyles from '@/main.module.scss'
import { AddCircle, MouseCircle, SearchStatus, Setting } from 'iconsax-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '@/providers/store-provider'
import { Input } from '@/components/Input/Input'
import { HighlightIcon } from '@/icons/icons'
import usePromptApps from '@/hooks/usePromptApps'
import Hotkey from '@/components/Hotkey/Hotkey'
import ExpandableVideo from '@/components/ExpandableVideo/ExpandableVideo'
import { useShallow } from 'zustand/react/shallow'
import { trackEvent } from '@/utils/amplitude'
import PersonalPrompts from '@/components/PersonalPrompts/PersonalPrompts'
import TrendingPrompts from '@/components/TrendingPrompts/TrendingPrompts'
import Button from '../Button/Button'
import { supabaseLoader } from '@/lib/supabase'
import Image from 'next/image'
import { Prompt } from '@/types/supabase-helpers'
import ConversationSimple from '@/components/Conversations/ConversationSimple'

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
      {/* <ConversationSimple /> */}
      {/* <Prompts userId={userId} /> */}
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

/**
 * A default prompt like Summarize, Explain, Write, or Analyze
 */
function DefaultPrompt({ externalId }: { externalId: string }) {
  const prompts = useStore((state) => state.prompts)
  const openModal = useStore((state) => state.openModal)
  const [prompt, setPrompt] = useState<Prompt | undefined>(undefined)

  useEffect(() => {
    const prompt = prompts.find((p) => p.external_id === externalId)
    setPrompt(prompt)
  }, [externalId, prompts])

  if (!prompt) {
    return <></>
  }

  function onClick() {
    openModal('customize-prompt', { prompt })
  }

  return (
    <div
      onClick={onClick}
      className="inline-flex flex-col items-start justify-start gap-3 rounded-[20px] bg-[#191919] p-5 transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-[#292929]"
    >
      <div className="inline-flex gap-2 text-base font-medium leading-normal text-[#eeeeee]">
        <Image
          src={`/user_content/${prompt.image}.${prompt.user_images?.file_extension}`}
          alt="Prompt image"
          className="h-6 w-6 rounded-full"
          width={24}
          height={24}
          loader={supabaseLoader}
        />
        {prompt.name}
      </div>
      <div className="inline-flex items-start justify-start gap-2 self-stretch">
        <Button size="xsmall" variant="tertiary" className={styles.filledButton} onClick={onClick}>
          Preview
        </Button>
        <div className="flex items-center justify-center gap-1 rounded-md border border-[#222222] px-2 py-0.5">
          <div className="text-[13px] font-medium leading-tight text-[#3a3a3a]">{prompt.public_use_number} Uses</div>
        </div>
      </div>
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
      {/* <div className="grid grid-cols-2 gap-4">
        <DefaultPrompt externalId="2d2d0033-edc7-4f43-bad9-3c0baaaee2ee" />
        <DefaultPrompt externalId="f9da16e0-ae49-43bb-95d3-5e89d3e3fc9b" />
        <DefaultPrompt externalId="957af06a-2f69-4854-a4d7-189bf3758a73" />
        <DefaultPrompt externalId="e9306eac-3dc2-4380-bb67-37f5ab3a1eaf" />
      </div> */}
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
