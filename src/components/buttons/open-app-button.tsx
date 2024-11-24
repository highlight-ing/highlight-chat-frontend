import { ComponentProps } from 'react'
import Highlight from '@highlight-ai/app-runtime'

type OpenAppButtonProps = ComponentProps<'button'> & { appId: 'conversations' | 'prompts' }

export function OpenAppButton({ appId, ...props }: OpenAppButtonProps) {
  async function handleClick() {
    try {
      await Highlight.app.openApp(appId)
    } catch (error) {
      console.error(`Failed to open the ${appId} app:`, error)
      window.location.href = `highlight://app/${appId}`
    }
  }

  return (
    <button type="button" aria-label={`Open ${appId}`} onClick={handleClick} {...props}>
      {props.children}
    </button>
  )
}
