import Highlight from '@highlight-ai/app-runtime'
import { ComponentProps } from 'react'
import { useStore } from '@/providers/store-provider'

export function CreateShortcutButton(props: ComponentProps<'button'>) {
  const openModal = useStore((state) => state.openModal)

  function handleClick() {
    openModal('create-prompt')
  }

  return (
    <button type="button" aria-label="Create Shortcut" onClick={handleClick} {...props}>
      {props.children}
    </button>
  )
}

export function BrowseShortcutsButton(props: ComponentProps<'button'>) {
  async function handleClick() {
    try {
      await Highlight.app.openApp('prompts')
    } catch (error) {
      console.error('Failed to open the prompts app:', error)
      window.location.href = 'highlight://app/prompts'
    }
  }

  return (
    <button type="button" aria-label="Browse Shortcuts" onClick={handleClick} {...props}>
      {props.children}
    </button>
  )
}
