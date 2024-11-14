import { useState } from 'react'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import styles from './screenshot.module.scss'
import Tooltip from '@/components/Tooltip/Tooltip'
import { MAX_NUMBER_OF_ATTACHMENTS } from '@/stores/chat-attachments'
import { Gallery } from 'iconsax-react'
import { ScreenshotAttachments } from './screenshot-attachments'
import { trackEvent } from '@/utils/amplitude'
import Highlight from '@highlight-ai/app-runtime'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export const ScreenshotDropdown = () => {
  const { attachments } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      addAttachment: state.addAttachment,
      setFileInputRef: state.setFileInputRef,
    })),
  )
  const [isOpen, setIsOpen] = useState(false)
  const dropdownId = 'screenshot'

  const onClickScreenshot = async () => {
    const hasScreenshotPermission = await Highlight.permissions.requestScreenshotPermission()

    if (!hasScreenshotPermission) {
      console.log('Screenshot permission denied')
      trackEvent('HL Chat Permission Denied', { type: 'screenshot' })
      return
    }

    trackEvent('HL Chat Screenshot Picker Opened', {})
  }

  const isDisabled = attachments.length >= MAX_NUMBER_OF_ATTACHMENTS

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip
        tooltip={isDisabled ? 'Max number of attahments added' : isOpen ? '' : 'Attach a screenshot'}
        position={'top'}
      >
        <PopoverTrigger
          disabled={isDisabled}
          onClick={onClickScreenshot}
          className={`${styles.button} ${isDisabled ? styles.disabledButton : ''}`}
        >
          <Gallery variant="Bold" size={24} className="text-tertiary" />
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent sideOffset={18} align="end" alignOffset={-54} className="w-64 space-y-2 p-2 pt-3">
        <ScreenshotAttachments />
      </PopoverContent>
    </Popover>
  )
}
