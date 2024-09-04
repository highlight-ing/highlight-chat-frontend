import { useStore } from '@/providers/store-provider'
import { createPortal } from 'react-dom'
import Highlight from '@highlight-ai/app-runtime'

import styles from './screenshot-attachment-picker.module.scss'
import { useEffect, useRef, useState } from 'react'
import { CloseIcon } from '@/icons/icons'
import { trackEvent } from '@/utils/amplitude'
import { ArrowCircleLeft, CloseCircle } from 'iconsax-react'
import { Portal } from 'react-portal'

interface ScreenshotAttachmentPickerProps {
  isVisible: boolean
  onClose: () => void
  onBack: () => void
}

export const ScreenshotAttachmentPicker = ({ isVisible, onClose, onBack }: ScreenshotAttachmentPickerProps) => {
  const [windows, setWindows] = useState<{ windowTitle: string; appIcon?: string }[]>([])
  const [displays, setDisplays] = useState<{ thumbnail: string }[]>([])
  const [portalStyles, setPortalStyles] = useState<React.CSSProperties>({})

  const addAttachment = useStore((state) => state.addAttachment)

  const containerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const newStyles: React.CSSProperties = {
      position: 'fixed',
    }

    const targetRect = containerRef.current.getBoundingClientRect()
    newStyles.top = targetRect.top - 500
    newStyles.left = targetRect.left

    if (targetRect.top - 500 < 0) {
      newStyles.top = 50
      newStyles.maxHeight = targetRect.top
    }

    setPortalStyles(newStyles)
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
      trackEvent('HL Chat Screenshot Picker Opened', {})
    }
  }, [isVisible])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (portalRef.current && !portalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

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

  return (
    <div ref={containerRef}>
      <Portal>
        {isVisible && (
          <div ref={portalRef} className={styles.innerContainer} style={{ ...portalStyles }}>
            <div className={styles.header}>
              <ArrowCircleLeft variant="Bold" size={24} onClick={handleBack} style={{ cursor: 'pointer' }} />
              <span>Attach Screenshot</span>
              <CloseCircle variant="Bold" size={24} onClick={handleClose} style={{ cursor: 'pointer' }} />
            </div>
            <div className={styles.rows}>
              {displays.map((display, index) => (
                <div
                  className={styles.screenshotContainer}
                  onClick={() => onClickDisplay(display.thumbnail)}
                  key={index}
                >
                  <img src={display.thumbnail} className={`${styles.image} ${styles.displayImage}`} />
                  <div className={styles.title}>Display {index + 1}</div>
                </div>
              ))}
              {windows.map((window, index) => (
                <div
                  className={styles.screenshotContainer}
                  onClick={() => onClickWindow(window.windowTitle)}
                  key={index}
                >
                  <img src={window.appIcon} className={`${styles.image} ${styles.appIcon}`} />
                  <div className={styles.title}>{window.windowTitle}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Portal>
    </div>
  )
}
