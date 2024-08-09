import { useStore } from '@/providers/store-provider'
import { createPortal } from 'react-dom'
import Highlight from '@highlight-ai/app-runtime'

import styles from './screenshot-attachment-picker.module.scss'
import { useEffect, useRef, useState } from 'react'
import { CloseIcon } from '@/icons/icons'

interface ScreenshotAttachmentPickerProps {
  isVisible: boolean
  onClose: () => void
}

export const ScreenshotAttachmentPicker = ({ isVisible, onClose }: ScreenshotAttachmentPickerProps) => {
  const [windows, setWindows] = useState<{ windowTitle: string; appIcon?: string }[]>([])
  const [displays, setDisplays] = useState<{ thumbnail: string }[]>([])

  const addAttachment = useStore((state) => state.addAttachment)

  const outerContainerRef = useRef<HTMLDivElement>(null)
  const innerContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        outerContainerRef.current &&
        innerContainerRef.current &&
        !innerContainerRef.current.contains(event.target as Node) &&
        outerContainerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const onAddScreenshot = async (screenshot: string) => {
    if (screenshot.length > 0) {
      addAttachment({
        type: 'image',
        value: screenshot
      })
    }
  }

  const onClickWindow = async (windowTitle: string) => {
    const screenshot = await Highlight.user.getWindowScreenshot(windowTitle)

    if (screenshot.length > 0) {
      onAddScreenshot(screenshot)
    }
    onClose()
  }

  const onClickDisplay = (thumbnail: string) => {
    onAddScreenshot(thumbnail)
    onClose()
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
    <>
      {isVisible &&
        createPortal(
          <div ref={outerContainerRef} className={styles.outerContainer}>
            <div ref={innerContainerRef} className={styles.innerContainer}>
              <div className={styles.closeButton} onClick={onClose}>
                <CloseIcon size={16} />
              </div>
              <div className={styles.displays}>
                <span className={styles.columnHeader}>Displays</span>
                <div className={styles.displayImages}>
                  {displays.map((display) => (
                    <img
                      src={display.thumbnail}
                      className={styles.display}
                      onClick={() => onClickDisplay(display.thumbnail)}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.windows}>
                <span className={styles.columnHeader}>Windows</span>
                <div className={styles.windowRows}>
                  {windows.map((window) => (
                    <div className={styles.window} onClick={() => onClickWindow(window.windowTitle)}>
                      <img src={window.appIcon} className={styles.windowIcon} />
                      <div className={styles.windowTitle}>{window.windowTitle}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
