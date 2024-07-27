import { useEffect, useRef, useState } from 'react'
import { ClipboardText, DocumentUpload, GalleryAdd, Sound } from 'iconsax-react'
import Highlight from '@highlight-ai/app-runtime'

import { PaperclipIcon } from '../../icons/icons'
import ContextMenu, { MenuItemType } from '../ContextMenu'
import styles from './attachments-button.module.scss'
import { useStore } from '@/providers/store-provider'
import { getDurationUnit } from '@/utils/string'
import { ScreenshotAttachmentPicker } from '../ScreenshotAttachmentPicker/ScrenshotAttachmentPicker'

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

  const { setFileInputRef, addAttachment } = useStore((state) => ({
    addAttachment: state.addAttachment,
    setFileInputRef: state.setFileInputRef
  }))

  useEffect(() => {
    setFileInputRef(fileInputRef)
  }, [fileInputRef])

  const handleAttachmentClick = () => {
    fileInputRef?.current?.click()
  }

  const onAddAudio = async (duration: number) => {
    // TODO: get audio for specified duration
    const audio = await Highlight.user.getAudio(false)
    addAttachment({ type: 'audio', value: audio, duration })
  }

  const onAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      addAttachment({
        type: 'image',
        value: URL.createObjectURL(file),
        file: file
      })
    } else if (file && file.type === 'application/pdf') {
      addAttachment({
        type: 'pdf',
        value: file
      })
    } else {
      alert('Please select a valid image or PDF file.')
    }
  }

  const onClickScreenshot = async () => {
    console.log('on click screenshot clicked')
    const hasClipboardReadPermissions = await Highlight.permissions.requestBackgroundPermission()

    if (!hasClipboardReadPermissions) {
      console.log('Screenshot permission denied')
      return
    }

    setScreenshotPickerVisible(true)
  }

  const onAddClipboard = async () => {
    console.log('on add clipboard clicked')
    const hasClipboardReadPermissions = await Highlight.permissions.requestBackgroundPermission()

    if (!hasClipboardReadPermissions) {
      console.log('Clipboard read permission denied')
      return
    }

    // TODO make request to actually get clipboard context
    // const clipboard = await Highlight.user.getClipboardContents()
    // const clipboard = undefined
    // const clipboard = { type: 'text', value: 'Clipboard text' }
    const clipboard = { type: 'image', value: 'Clipboard image' }
    if (!clipboard) return

    if (clipboard.type === 'image') {
      addAttachment({
        type: 'image',
        value: clipboard.value
      })
    } else {
      addAttachment({
        type: 'clipboard',
        value: clipboard.value
      })
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
      <ContextMenu position="top" alignment="left" triggerId="attachments-button" leftClick={true} items={menuItems}>
        <button type="button" className={styles.button} id="attachments-button">
          <PaperclipIcon />
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAddFile}
            accept="image/*,application/pdf"
            className={styles.hiddenInput}
          />
        </button>
      </ContextMenu>
      <ScreenshotAttachmentPicker
        isVisible={screenshotPickerVisible}
        onClose={() => setScreenshotPickerVisible(false)}
      />
    </>
  )
}
