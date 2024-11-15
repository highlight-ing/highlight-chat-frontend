import { useEffect, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { HighlightIcon } from '@/components/icons'
import { Input } from '@/components/Input/Input'
import { useStore } from '@/components/providers/store-provider'

import { LatestConversation } from './LatestConversation'

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
        'pointer-events-none fixed flex h-full w-[min(800px,95%)] flex-col justify-between gap-6 pb-3 pt-[8vh] opacity-0',
        {
          'pointer-events-auto relative opacity-100': isShowing,
        },
      )}
    >
      <div className="flex flex-col gap-16">
        <InputHeading />
        {isVisible && <Input isActiveChat={false} />}
      </div>

      <div className="mx-auto flex items-center gap-1 font-semibold text-subtle">
        <HighlightIcon size={20} color="#484848" />
        <p>Highlight AI</p>
      </div>
    </div>
  )
}
