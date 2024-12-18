import { ClipboardFileDropdown } from './clipboard-file-dropdown/clipboard-file-dropdown'
import { ConversationsDropdown } from './conversations/conversations-dropdown'
import { ScreenshotDropdown } from './screenshot/screenshot-dropdown'

export function AttachmentDropdowns() {
  return (
    <>
      <ClipboardFileDropdown />
      <ScreenshotDropdown />
      <ConversationsDropdown />
    </>
  )
}
