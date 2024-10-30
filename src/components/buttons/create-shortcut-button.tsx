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
