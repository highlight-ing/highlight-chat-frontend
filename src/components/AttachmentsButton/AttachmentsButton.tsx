import { useEffect, useRef, useState } from 'react'
import { ClipboardText, DocumentUpload, GalleryAdd, Sound } from 'iconsax-react'
import Highlight from '@highlight-ai/app-runtime'
import { PaperclipIcon } from '@/icons/icons'
import ContextMenu, { MenuItemType } from '../ContextMenu/ContextMenu'
import { useStore } from '@/providers/store-provider'
import { getDurationUnit } from '@/utils/string'
import { ScreenshotAttachmentPicker } from '../ScreenshotAttachmentPicker/ScrenshotAttachmentPicker'
import { useShallow } from 'zustand/react/shallow'
import styles from './attachments-button.module.scss'
import Tooltip from '@/components/Tooltip/Tooltip'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import * as pptxtojson from 'pptxtojson'
import { trackEvent } from '@/utils/amplitude'

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
    trackEvent('HL Chat Attachments Button Clicked', {})
  }

  const onAddAudio = async (durationInMinutes: number) => {
    const audio = await Highlight.user.getAudioForDuration(durationInMinutes * 60)
    addAttachment({ type: 'audio', value: audio, duration: durationInMinutes })
    trackEvent('HL Chat Attachment Added', { type: 'audio', durationInMinutes })
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
        trackEvent('HL Chat Attachment Added', { type: 'image', fileType: file.type })
      } else if (file.type === 'application/pdf') {
        addAttachment({
          type: 'pdf',
          value: file,
        })
        trackEvent('HL Chat Attachment Added', { type: 'pdf' })
      } else if (
        file.type === 'text/csv' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        addAttachment({
          type: 'spreadsheet',
          value: file,
        })
        trackEvent('HL Chat Attachment Added', { type: 'spreadsheet', fileType: file.type })
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
        trackEvent('HL Chat Attachment Added', { type: 'text_file', fileType: file.type })
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        const value = await extractTextFromPowerPoint(file)
        addAttachment({
          type: 'text_file',
          value,
          fileName: file.name,
        })
        trackEvent('HL Chat Attachment Added', { type: 'power_point', fileType: file.type })
      } else if (
        textBasedTypes.includes(file.type) ||
        file.type.includes('application/') ||
        file.type.includes('text/')
      ) {
        const value = await readTextFile(file)
        addAttachment({
          type: 'text_file',
          value,
          fileName: file.name,
        })
        trackEvent('HL Chat Attachment Added', { type: 'text_file', fileType: file.type })
      } else {
        try {
          const value = await readTextFile(file)
          addAttachment({
            type: 'text_file',
            value,
            fileName: file.name,
          })
          trackEvent('HL Chat Attachment Added', { type: 'file', fileType: file.type })
        } catch (e) {
          console.log('Error reading file', file.name, e)
        }
      }
    }
  }

  const onClickScreenshot = async () => {
    const hasScreenshotPermission = await Highlight.permissions.requestScreenshotPermission()

    if (!hasScreenshotPermission) {
      console.log('Screenshot permission denied')
      trackEvent('HL Chat Permission Denied', { type: 'screenshot' })
      return
    }

    setScreenshotPickerVisible(true)
    trackEvent('HL Chat Screenshot Picker Opened', {})
  }

  const onAddClipboard = async () => {
    const hasClipboardReadPermission = await Highlight.permissions.requestClipboardReadPermission()

    if (!hasClipboardReadPermission) {
      console.log('Clipboard read permission denied')
      trackEvent('HL Chat Permission Denied', { type: 'clipboard' })
      return
    }

    const clipboard = await Highlight.user.getClipboardContents()
    if (!clipboard) return

    if (clipboard.type === 'image') {
      addAttachment({
        type: 'image',
        value: clipboard.value,
      })
      trackEvent('HL Chat Attachment Added', { type: 'clipboard_image' })
    } else {
      addAttachment({
        type: 'clipboard',
        value: clipboard.value,
      })
      trackEvent('HL Chat Attachment Added', { type: 'clipboard_text' })
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
          <Sound size={20} variant={'Bold'} />
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
          <DocumentUpload size={20} variant={'Bold'} />
          Upload from computer
        </div>
      ),
      onClick: handleAttachmentClick,
    },
    {
      label: (
        <div className={styles.menuItem}>
          <ClipboardText size={20} variant={'Bold'} />
          Clipboard
        </div>
      ),
      onClick: onAddClipboard,
    },
    {
      label: (
        <div className={styles.menuItem}>
          <GalleryAdd variant="Bold" size={20} />
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
    'text/*,image/*,application/*,application/pdf,application/json,application/xml,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,.tsx,.jsx,.md,.yaml,.yml,.toml,.ts,.js,.py,.rs,.swift,.java'

  const openMenu = () => {
    const element = document.getElementById('attachments-button')
    if (element) {
      setTimeout(() => {
        element.click()
      }, 50)
    }
  }

  return (
    <>
      <ContextMenu position="top" triggerId="attachments-button" leftClick={true} items={menuItems}>
        {
          // @ts-ignore
          ({ isOpen }) => (
            <Tooltip tooltip={isOpen || screenshotPickerVisible ? '' : 'Attach files & context'} position={'top'}>
              <ScreenshotAttachmentPicker
                isVisible={screenshotPickerVisible}
                onClose={() => {
                  setScreenshotPickerVisible(false)
                  trackEvent('HL Chat Screenshot Picker Closed', {})
                }}
                onBack={openMenu}
              />
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
            </Tooltip>
          )
        }
      </ContextMenu>
    </>
  )
}
