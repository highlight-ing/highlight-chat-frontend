import { useEffect, useRef, useState } from 'react'
import { ClipboardText, DocumentUpload, GalleryAdd, Sound } from 'iconsax-react'
import Highlight from '@highlight-ai/app-runtime'

import { PaperclipIcon } from '../../icons/icons'
import ContextMenu, { MenuItemType } from '../ContextMenu/ContextMenu'
import styles from './attachments-button.module.scss'
import { useStore } from '@/providers/store-provider'
import { getDurationUnit } from '@/utils/string'
import { ScreenshotAttachmentPicker } from '../ScreenshotAttachmentPicker/ScrenshotAttachmentPicker'
import {useShallow} from "zustand/react/shallow";
import { trackEvent } from '@/utils/amplitude';

interface AudioDurationProps {
  duration: number
  unit: 'hours' | 'minutes'
  onClick?: () => void
}

const AudioDuration = ({ duration, unit, onClick }: AudioDurationProps) => {
  const unitLabel = getDurationUnit(duration, unit, true)

  return (
    <div className={styles.audioDurationContainer} onClick={onClick}>
      {duration} {unitLabel}
    </div>
  )
}

export const AttachmentsButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [screenshotPickerVisible, setScreenshotPickerVisible] = useState(false)

  const { setFileInputRef, addAttachment } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
      setFileInputRef: state.setFileInputRef
    }))
  )

  useEffect(() => {
    setFileInputRef(fileInputRef)
  }, [fileInputRef])

  const handleAttachmentClick = () => {
    fileInputRef?.current?.click()
    trackEvent('hl_chat_attachments_button_clicked', {});
  }

  const onAddAudio = async (durationInMinutes: number) => {
    const audio = await Highlight.user.getAudioForDuration(durationInMinutes * 60)
    addAttachment({ type: 'audio', value: audio, duration: durationInMinutes })
    trackEvent('hl_chat_audio_attachment_added', { durationInMinutes });
  }

  const onAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        addAttachment({
          type: 'image',
          value: URL.createObjectURL(file),
          file: file
        })
        trackEvent('hl_chat_image_attachment_added', { fileType: file.type });
      } else if (file.type === 'application/pdf') {
        addAttachment({
          type: 'pdf',
          value: file
        })
        trackEvent('hl_chat_pdf_attachment_added', {});
      } else if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        addAttachment({
          type: 'spreadsheet',
          value: file
        })
        trackEvent('hl_chat_spreadsheet_attachment_added', { fileType: file.type });
      }
    }
  }

  const onClickScreenshot = async () => {
    const hasClipboardReadPermissions = await Highlight.permissions.requestScreenshotPermission()

    if (!hasClipboardReadPermissions) {
      console.log('Screenshot permission denied')
      trackEvent('hl_chat_screenshot_permission_denied', {});
      return
    }

    setScreenshotPickerVisible(true)
    trackEvent('hl_chat_screenshot_picker_opened', {});
  }

  const onAddClipboard = async () => {
    const hasClipboardReadPermissions = await Highlight.permissions.requestClipboardReadPermission()

    if (!hasClipboardReadPermissions) {
      console.log('Clipboard read permission denied')
      trackEvent('hl_chat_clipboard_permission_denied', {});
      return
    }

    const clipboard = await Highlight.user.getClipboardContents()
    if (!clipboard) return

    if (clipboard.type === 'image') {
      addAttachment({
        type: 'image',
        value: clipboard.value
      })
      trackEvent('hl_chat_clipboard_image_added', {});
    } else {
      addAttachment({
        type: 'clipboard',
        value: clipboard.value
      })
      trackEvent('hl_chat_clipboard_text_added', {});
    }
  }

  const audioDurations: { duration: number; unit: 'hours' | 'minutes' }[] = [
    { duration: 5, unit: 'minutes' },
    { duration: 30, unit: 'minutes' },
    { duration: 1, unit: 'hours' },
    { duration: 2, unit: 'hours' }
  ]

  const audioMenuItem = {
    label: (
      <div className={styles.audioMenuItem}>
        <div className={styles.menuItem}>
          <Sound size={24} color="#fff" />
          Audio Memory
        </div>
        <div className={styles.audioDurationsContainer}>
          {audioDurations.map(({ duration, unit }) => (
            <AudioDuration
              key={`${duration}-${unit}`}
              duration={duration}
              unit={unit}
              onClick={async () => await onAddAudio(duration * (unit === 'hours' ? 60 : 1))}
            />
          ))}
        </div>
      </div>
    )
  }

  const menuItems = [
    audioMenuItem,
    {
      divider: true
    },
    {
      label: (
        <div className={styles.menuItem}>
          <ClipboardText size={24} color="#fff" />
          Clipboard
        </div>
      ),
      onClick: onAddClipboard
    },
    {
      label: (
        <div className={styles.menuItem}>
          <GalleryAdd variant="Bold" size={24} color="#fff" />
          Screenshot
        </div>
      ),
      onClick: onClickScreenshot
    },
    {
      label: (
        <div className={styles.menuItem}>
          <DocumentUpload size={24} color="#fff" />
          Upload from computer
        </div>
      ),
      onClick: handleAttachmentClick
    }
  ].filter(Boolean) as MenuItemType[]

  return (
    <>
      <ContextMenu position="top" triggerId="attachments-button" leftClick={true} items={menuItems}>
        <button type="button" className={styles.button} id="attachments-button">
          <PaperclipIcon />
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAddFile}
            accept="image/*,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className={styles.hiddenInput}
          />
        </button>
      </ContextMenu>
      <ScreenshotAttachmentPicker
        isVisible={screenshotPickerVisible}
        onClose={() => {
          setScreenshotPickerVisible(false)
          trackEvent('hl_chat_screenshot_picker_closed', {});
        }}
      />
    </>
  )
}