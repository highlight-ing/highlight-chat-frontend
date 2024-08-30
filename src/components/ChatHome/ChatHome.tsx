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

const ChatHome = ({ isShowing }: { isShowing: boolean }) => {
  const { openModal, closeModal } = useStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )
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
      <Prompts userId={userId} openModal={openModal} />
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

const Prompts = ({
  userId,
  openModal,
}: {
  userId: string | undefined
  openModal: (modal: string, context?: Record<string, any>) => void
}) => {
  const { isLoadingPrompts, myPrompts, communityPrompts, selectPrompt } = usePromptApps()

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
        <PersonalPrompts userId={userId} prompts={myPrompts} openModal={openModal} selectPrompt={selectPrompt} />
      </div>
      <div className={styles.callouts}>
        <TrendingPrompts prompts={communityPrompts} openModal={openModal} selectPrompt={selectPrompt} />
      </div>
    </>
  )
}

const oldPrompts = () => {
  const openModal = useStore((state) => state.openModal)
  const { isLoadingPrompts, myPrompts, selectPrompt } = usePromptApps()
  const [hotkey, setHotkey] = useState<string>('alt + .')

  useEffect(() => {
    const fetchHotkey = async () => {
      const hotkey = await Highlight.app.getHotkey()
      setHotkey(hotkey)
      trackEvent('HL Chat Hotkey Fetched', { hotkey })
    }
    fetchHotkey()
  }, [])

  if (isLoadingPrompts) {
    return (
      <div className={`${styles.prompts} ${mainStyles.loadingGradient}`}>
        <div className={'h-20 w-full p-16'} />
      </div>
    )
  }

  if (!myPrompts.length) {
    return <HighlightTutorial hotkey={hotkey} />
  }

  return (
    <div className={styles.prompts}>
      {myPrompts.map((prompt: Prompt) => {
        return (
          <PromptListRow
            key={prompt.external_id}
            prompt={prompt}
            type={'self'}
            onClick={() => {
              selectPrompt(prompt)
              trackEvent('HL Chat Prompt Selected', { promptSlug: prompt.slug })
            }}
            onClickEdit={() => {
              openModal('edit-prompt', { prompt: prompt })
            }}
          />
        )
      })}

      <PromptListRow
        // @ts-ignore
        prompt={{ slug: 'create', description: 'Create your own chat app' }}
        icon={<AddCircle variant={'Bold'} color={variables.light60} />}
        type={'default'}
        onClick={() => {
          openModal('create-prompt')
          trackEvent('HL Chat Start Create Chat App', { context: 'Chat Home List' })
        }}
      />
    </div>
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
