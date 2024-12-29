import React from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { showHistoryAtom } from '@/atoms/history'
import { isOnHomeAtom, sidePanelOpenAtom } from '@/atoms/side-panel'
import { useStore } from '@/components/providers/store-provider'

import { chatInputIsFocusedAtom } from '../atoms'
import { ChatInput } from '../chat-input/chat-input'
import { HomeFeed } from '../home-feed/components/home-feed'

function InputHeading() {
  const { promptName, promptDescription } = useStore(
    useShallow((state) => ({
      promptName: state.promptName,
      promptDescription: state.promptDescription,
    })),
  )

  if (!promptName || !promptDescription) return null

  return (
    <div className="flex flex-col gap-1 text-center">
      <h3 className="text-xl text-light-40">{promptName}</h3>
      <p className="text-light-60">{promptDescription}</p>
    </div>
  )
}

function ChatFocusedOverlay() {
  const [chatInputIsFocused, setChatInputIsFocused] = useAtom(chatInputIsFocusedAtom)

  function handleClick() {
    setChatInputIsFocused(false)
  }

  if (!chatInputIsFocused) return null

  return (
    <div
      onClick={handleClick}
      className={cn(
        'fixed inset-0 z-[15] bg-black/70 backdrop-blur-[2px]',
        chatInputIsFocused ? 'animate-in fade-in-0' : 'animate-out fade-out-0 ',
      )}
    />
  )
}

export function ChatHome() {
  const setSidePanelOpen = useSetAtom(sidePanelOpenAtom)
  const isOnHome = useAtomValue(isOnHomeAtom)
  const setShowHistory = useSetAtom(showHistoryAtom)

  React.useEffect(() => {
    trackEvent('HL Chat Home Viewed', {})
  }, [])

  setShowHistory(false)
  setSidePanelOpen(true)

  return (
    <div
      className={cn(
        'pointer-events-none fixed flex h-full w-full flex-col justify-between gap-6 px-3 pb-4 pt-16 opacity-0',
        isOnHome && 'pointer-events-auto relative opacity-100',
      )}
    >
      <div className="space-y-4">
        <div className="space-y-6">
          <InputHeading />
          <ChatInput />
        </div>
        <HomeFeed />
      </div>
      <ChatFocusedOverlay />
    </div>
  )
}
