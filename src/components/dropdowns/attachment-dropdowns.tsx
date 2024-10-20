import { RefObject, useState, createContext, Dispatch, SetStateAction } from 'react'
import { ConversationsDropdown } from './conversations/conversations-dropdown'
import { ScreenshotDropdown } from './screenshot/screenshot-dropdown'
import { ClipboardFileDropdown } from './clipboard-file-dropdown/clipboard-file-dropdown'

interface AttachmentDropdownsProps {
  inputRef: RefObject<HTMLTextAreaElement>
  isInputFocused: boolean
}

export const AttachmentDropdownsContext = createContext<{
  activeDropdown: string
  setActiveDropdown: Dispatch<SetStateAction<string>>
}>({ activeDropdown: '', setActiveDropdown: () => '' })

export function AttachmentDropdowns({ inputRef, isInputFocused }: AttachmentDropdownsProps) {
  const [activeDropdown, setActiveDropdown] = useState('')

  function onCloseAutoFocus(e: Event) {
    e.preventDefault()
    if (inputRef && isInputFocused) inputRef.current?.focus()
  }

  return (
    <AttachmentDropdownsContext.Provider value={{ activeDropdown, setActiveDropdown }}>
      <div className="flex items-center gap-2">
        <ClipboardFileDropdown onCloseAutoFocus={onCloseAutoFocus} />
        <ScreenshotDropdown onCloseAutoFocus={onCloseAutoFocus} />
        <ConversationsDropdown onCloseAutoFocus={onCloseAutoFocus} />
      </div>
    </AttachmentDropdownsContext.Provider>
  )
}
