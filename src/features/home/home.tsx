import React from 'react'
import { useSetAtom } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { sidePanelOpenAtom } from '@/atoms/side-panel'
import { HighlightIcon } from '@/components/icons'
import { Input } from '@/components/Input/Input'
import { useStore } from '@/components/providers/store-provider'

import { HomeFeed } from './home-feed/home-feed'

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

export function ChatHome() {
  const setSidePanelOpen = useSetAtom(sidePanelOpenAtom)

  React.useEffect(() => {
    trackEvent('HL Chat Home Viewed', {})
  }, [])

  setSidePanelOpen(true)

  return (
    <div
      className={cn(
        'pointer-events-none fixed mt-12 flex h-full w-full flex-col justify-between gap-6 px-3 py-4 opacity-0',
        'pointer-events-auto relative opacity-100',
      )}
    >
      <div className="space-y-12">
        <div className="space-y-6">
          <InputHeading />
          <Input isActiveChat={false} />
        </div>
        <HomeFeed />
      </div>

      <div className="mx-auto flex items-center gap-1 font-semibold text-subtle">
        <HighlightIcon size={20} color="#484848" />
        <p>Highlight AI</p>
      </div>
    </div>
  )
}
