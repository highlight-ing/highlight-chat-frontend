import Button from '@/components/Button/Button'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { useRef, useState } from 'react'

export function PromptShareLinkButton({ promptSlug }: { promptSlug: string }) {
  const timeout = useRef<NodeJS.Timeout | null>(null)

  const slug = promptSlug

  // const host = window.location.protocol + '//' + window.location.host
  const url = `https://chat.highlight.ing/prompts/${slug}`

  const [copied, setCopied] = useState(false)

  function onCopyLinkClick() {
    if (copied) {
      return
    }

    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    navigator.clipboard.writeText(url)
    setCopied(true)

    timeout.current = setTimeout(() => {
      setCopied(false)
    }, 2500)
  }

  return (
    <Button onClick={onCopyLinkClick} size={'large'} variant={'ghost'} style={{ marginRight: '6px' }} disabled={!slug}>
      {copied ? 'Copied link to clipboard!' : 'Share'}
    </Button>
  )
}
