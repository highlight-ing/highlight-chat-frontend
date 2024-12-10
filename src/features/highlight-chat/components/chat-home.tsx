import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { HighlightIcon } from '@/components/icons'
import { Input } from '@/components/Input/Input'
import { useStore } from '@/components/providers/store-provider'
import { Stacker, StackerItem } from '@/components/stacker'

import { ViewChangelogBanner } from '@/features/changelog/view-changelog-banner'

import { HomeFeed } from '../home-feed/home-feed'

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

export function ChatHome({ isShowing }: { isShowing: boolean }) {
  const [isVisible, setVisible] = useState(isShowing)

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
    <div
      className={cn(
        'pointer-events-none fixed flex h-full w-[min(800px,95%)] flex-col justify-between gap-6 pb-3 pt-24 opacity-0',
        {
          'pointer-events-auto relative opacity-100': isShowing,
        },
      )}
    >
      <div className="space-y-12">
        <div className="space-y-6">
          <InputHeading />
          <Stacker>
            <StackerItem index={0}>{isVisible && <Input isActiveChat={false} />}</StackerItem>
            <StackerItem index={1}>
              <ViewChangelogBanner />
            </StackerItem>
          </Stacker>
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
