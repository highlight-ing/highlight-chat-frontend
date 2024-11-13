import { ConversationsDropdown } from './conversations/conversations-dropdown'
import { ScreenshotDropdown } from './screenshot/screenshot-dropdown'
import { ClipboardFileDropdown } from './clipboard-file-dropdown/clipboard-file-dropdown'

export function AttachmentDropdowns() {
  return (
    <div className="flex items-center gap-2">
      <ClipboardFileDropdown />
      <ScreenshotDropdown />
      <ConversationsDropdown />
    </div>
  )
}
