import { ClipboardAndFileMenu } from './ClipboardAndFileMenu'
import { ConversationsMenu } from './ConversationsMenu'
import { Dispatch, SetStateAction } from 'react'

export function AttachmentMenu({
  setIsInteractingWithInput,
}: {
  setIsInteractingWithInput: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <div onClick={() => setIsInteractingWithInput(true)} className="flex items-center gap-2">
      <ClipboardAndFileMenu />
      <ConversationsMenu />
    </div>
  )
}
