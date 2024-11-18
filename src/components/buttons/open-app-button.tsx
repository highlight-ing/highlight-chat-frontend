import { ComponentProps } from 'react'
import Highlight from '@highlight-ai/app-runtime'

type OpenAppButtonProps = ComponentProps<'button'> & { appId: 'conversations' | 'prompts' }

export function OpenAppButton(props: OpenAppButtonProps) {
  async function handleClick() {
    try {
      await Highlight.app.openApp(props.appId)
    } catch (error) {
      console.error(`Failed to open the ${props.appId} app:`, error)
      window.location.href = `highlight://app/${props.appId}`
    }
  }

  return (
    <button type="button" aria-label={`Open ${props.appId}`} onClick={handleClick} {...props}>
      {props.children}
    </button>
  )
}
