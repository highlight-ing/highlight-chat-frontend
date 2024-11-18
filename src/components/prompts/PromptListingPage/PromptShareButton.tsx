'use client'

import { useRef, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'

import Button from '@/components/Button/Button'

export default function PromptShareButton() {
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const [copied, setCopied] = useState(false)

  function onShareClick() {
    trackEvent('Prompt Store Listing', {
      action: 'Share clicked',
    })

    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    setCopied(true)
    navigator.clipboard.writeText(window.location.href)

    timeout.current = setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  return (
    <Button disabled={copied} onClick={onShareClick} size="small" variant="tertiary">
      {copied ? 'Copied' : 'Share'}
    </Button>
  )
}
