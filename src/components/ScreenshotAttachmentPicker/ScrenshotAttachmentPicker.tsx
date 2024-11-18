import { useEffect, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'
import Highlight from '@highlight-ai/app-runtime'

import { useStore } from '@/components/providers/store-provider'

import { AttachmentPicker } from '../AttachmentPicker/AttachmentPicker'
import styles from './screenshot-attachment-picker.module.scss'

interface ScreenshotAttachmentPickerProps {
  isVisible: boolean
  onClose: () => void
  onBack: () => void
}

export const ScreenshotAttachmentPicker = ({ isVisible, onClose, onBack }: ScreenshotAttachmentPickerProps) => {
  const [windows, setWindows] = useState<{ windowTitle: string; appIcon?: string }[]>([])
  const [displays, setDisplays] = useState<{ thumbnail: string }[]>([])

  const addAttachment = useStore((state) => state.addAttachment)

  useEffect(() => {
    if (isVisible) {
      trackEvent('HL Chat Screenshot Picker Opened', {})
    }
  }, [isVisible])

  const handleClose = () => {
    trackEvent('HL Chat Screenshot Picker Closed', {})
    onClose()
  }

  const handleBack = () => {
    onClose()
    onBack()
  }

  const onAddScreenshot = async (screenshot: string, source: 'display' | 'window') => {
    if (screenshot.length > 0) {
      addAttachment({
        type: 'image',
        value: screenshot,
      })
      trackEvent('HL Chat Screenshot Attached', { source })
    }
  }

  const onClickWindow = async (windowTitle: string) => {
    const screenshot = await Highlight.user.getWindowScreenshot(windowTitle)

    if (screenshot.length > 0) {
      onAddScreenshot(screenshot, 'window')
    }
    handleClose()
  }

  const onClickDisplay = (thumbnail: string) => {
    onAddScreenshot(thumbnail, 'display')
    handleClose()
  }

  useEffect(() => {
    const fetchWindows = async () => {
      const windows = await Highlight.user.getWindows()
      setWindows(windows)
    }

    const fetchDisplays = async () => {
      const displays = await Highlight.user.getDisplayScreenshots()
      setDisplays(displays)
    }

    if (isVisible) {
      fetchWindows()
      fetchDisplays()
    }
  }, [isVisible])

  const displayOptions = displays.map((display, index) => ({
    imageComponent: <img src={display.thumbnail} className={`${styles.image} ${styles.displayImage}`} />,
    title: `Display ${index + 1}`,
    onClick: () => onClickDisplay(display.thumbnail),
  }))

  const windowOptions = windows.map((window) => ({
    imageComponent: <img src={window.appIcon} className={`${styles.image} ${styles.appIcon}`} />,
    title: window.windowTitle,
    onClick: () => onClickWindow(window.windowTitle),
  }))

  const attachmentOptions = [...displayOptions, ...windowOptions]

  return (
    <AttachmentPicker
      header="Attach Screenshot"
      onBack={handleBack}
      onClose={handleClose}
      isVisible={isVisible}
      attachmentOptions={attachmentOptions}
    />
  )
}
