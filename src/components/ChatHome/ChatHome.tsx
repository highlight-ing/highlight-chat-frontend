import styles from './chathome.module.scss'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/providers/store-provider'
import { Input } from '@/components/Input/Input'
import { HighlightIcon } from '@/icons/icons'
import { useShallow } from 'zustand/react/shallow'
import { trackEvent } from '@/utils/amplitude'

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

export default function ChatHome({ isShowing }: { isShowing: boolean }) {
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
    <div className={`${styles.chatHomeContainer} ${isShowing ? styles.show : ''} h-full justify-between`}>
      <div className={styles.input}>
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
