import { useEffect, useRef, useState } from 'react'
import { ClipboardText, DocumentUpload, GalleryAdd, Sound } from 'iconsax-react'
import Highlight from '@highlight-ai/app-runtime'

import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import * as pptxtojson from 'pptxtojson'

import { PaperclipIcon } from '../../icons/icons'
import ContextMenu, { MenuItemType } from '../ContextMenu/ContextMenu'
import styles from './attachments-button.module.scss'
import { useStore } from '@/providers/store-provider'
import { getDurationUnit } from '@/utils/string'
import { ScreenshotAttachmentPicker } from '../ScreenshotAttachmentPicker/ScrenshotAttachmentPicker'
import { useShallow } from 'zustand/react/shallow'

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
      setFileInputRef: state.setFileInputRef,
    })),
  )

  useEffect(() => {
    setFileInputRef(fileInputRef)
  }, [fileInputRef])

  const handleAttachmentClick = () => {
    fileInputRef?.current?.click()
  }

  const onAddAudio = async (durationInMinutes: number) => {
    const audio = await Highlight.user.getAudioForDuration(durationInMinutes * 60)
    addAttachment({ type: 'audio', value: audio, duration: durationInMinutes })
  }

  const textBasedTypes = [
    'application/json',
    'application/xml',
    'application/javascript',
    'application/typescript',
    'application/x-sh',
  ]

  const onAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        addAttachment({
          type: 'image',
          value: URL.createObjectURL(file),
          file: file,
        })
      } else if (file.type === 'application/pdf') {
        addAttachment({
          type: 'pdf',
          value: file,
        })
      } else if (
        file.type === 'text/csv' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        addAttachment({
          type: 'spreadsheet',
          value: file,
        })
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        addAttachment({
          type: 'text_file',
          value: result.value,
          fileName: file.name,
        })
      } else if (textBasedTypes.includes(file.type) || file.type.includes('text/')) {
        const value = await readTextFile(file)
        addAttachment({
          type: 'text_file',
          value,
          fileName: file.name,
        })
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        const value = await extractTextFromPowerPoint(file)
        addAttachment({
          type: 'text_file',
          value,
          fileName: file.name,
        })
      }
    }
  }

  const readTextFile = async (file: File): Promise<string> => {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  const extractTextFromPowerPoint = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const json = await pptxtojson.parse(arrayBuffer)

    const cleanText = (text: string): string => {
      return text
        .replace(/&nbsp;/g, ' ')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const slideText = json.slides
      .map((slide, index) => {
        const slideNumber = index + 1
        const slideContent = slide.elements
          .filter((e) => e.type === 'text')
          .map((e) => cleanText(e.content))
          .filter((text) => text.length > 0)
          .join('\n')

        return slideContent.length > 0 ? `[Slide ${slideNumber}]\n${slideContent}` : ''
      })
      .filter((text) => text.length > 0)
      .join('\n\n')

    return slideText
  }

  const onClickScreenshot = async () => {
    const hasClipboardReadPermissions = await Highlight.permissions.requestScreenshotPermission()

    if (!hasClipboardReadPermissions) {
      console.log('Screenshot permission denied')
      return
    }

    setScreenshotPickerVisible(true)
  }

  const onAddClipboard = async () => {
    const hasClipboardReadPermissions = await Highlight.permissions.requestClipboardReadPermission()

    if (!hasClipboardReadPermissions) {
      console.log('Clipboard read permission denied')
      return
    }

    const clipboard = await Highlight.user.getClipboardContents()
    if (!clipboard) return

    if (clipboard.type === 'image') {
      addAttachment({
        type: 'image',
        value: clipboard.value,
      })
    } else {
      addAttachment({
        type: 'clipboard',
        value: clipboard.value,
      })
    }
  }

  const audioDurations: { duration: number; unit: 'hours' | 'minutes' }[] = [
    { duration: 5, unit: 'minutes' },
    { duration: 30, unit: 'minutes' },
    { duration: 1, unit: 'hours' },
    { duration: 2, unit: 'hours' },
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
    ),
  }

  const menuItems = [
    {
      label: (
        <div className={styles.menuItem}>
          <DocumentUpload size={24} color="#fff" />
          Upload from computer
        </div>
      ),
      onClick: handleAttachmentClick,
    },
    {
      label: (
        <div className={styles.menuItem}>
          <ClipboardText size={24} color="#fff" />
          Clipboard
        </div>
      ),
      onClick: onAddClipboard,
    },
    {
      label: (
        <div className={styles.menuItem}>
          <GalleryAdd variant="Bold" size={24} color="#fff" />
          Screenshot
        </div>
      ),
      onClick: onClickScreenshot,
    },
    {
      divider: true,
    },
    audioMenuItem,
  ].filter(Boolean) as MenuItemType[]

  const acceptTypes =
    'text/*,image/*,application/pdf,application/json,application/xml,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation'

  return (
    <>
      <ContextMenu position="top" triggerId="attachments-button" leftClick={true} items={menuItems}>
        <button type="button" className={styles.button} id="attachments-button">
          <PaperclipIcon />
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAddFile}
            accept={acceptTypes}
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
