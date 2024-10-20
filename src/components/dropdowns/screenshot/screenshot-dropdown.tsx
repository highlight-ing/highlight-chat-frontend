import { useContext, useEffect, useState } from 'react'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import styles from './screenshot.module.scss'
import Tooltip from '@/components/Tooltip/Tooltip'
import { MAX_NUMBER_OF_ATTACHMENTS } from '@/stores/chat-attachments'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Gallery } from 'iconsax-react'
import { ScreenshotAttachments } from './screenshot-attachments'
import { AttachmentDropdownsContext } from '../attachment-dropdowns'

interface ScreenshotDropdownProps {
  onCloseAutoFocus: (e: Event) => void
}

export const ScreenshotDropdown = ({ onCloseAutoFocus }: ScreenshotDropdownProps) => {
  const { attachments } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      addAttachment: state.addAttachment,
      setFileInputRef: state.setFileInputRef,
    })),
  )
  const { activeDropdown, setActiveDropdown } = useContext(AttachmentDropdownsContext)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownId = 'screenshot'

  useEffect(() => {
    if (isOpen) setActiveDropdown(dropdownId)
  }, [isOpen])

  useEffect(() => {
    if (activeDropdown !== dropdownId) setIsOpen(false)
  }, [activeDropdown, setIsOpen])

  const isDisabled = attachments.length >= MAX_NUMBER_OF_ATTACHMENTS

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip
        tooltip={isDisabled ? 'Max number of attahments added' : isOpen ? '' : 'Attach a screenshot'}
        position={'top'}
      >
        <DropdownMenuTrigger
          disabled={isDisabled}
          className={`${styles.button} ${isDisabled ? styles.disabledButton : ''}`}
        >
          <Gallery variant="Bold" size={24} className="text-tertiary" />
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent
        onCloseAutoFocus={onCloseAutoFocus}
        sideOffset={18}
        align="end"
        alignOffset={-54}
        className="space-y-2"
      >
        <ScreenshotAttachments />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
