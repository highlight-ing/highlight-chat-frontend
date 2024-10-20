import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useStore } from '@/providers/store-provider'
import Highlight from '@highlight-ai/app-runtime'
import styles from './screenshot.module.scss'
import { useEffect, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'

export const ScreenshotAttachments = () => {
  const [windows, setWindows] = useState<{ windowTitle: string; appIcon?: string }[]>([])
  const [displays, setDisplays] = useState<{ thumbnail: string }[]>([])
  const addAttachment = useStore((state) => state.addAttachment)

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
  }

  const onClickDisplay = (thumbnail: string) => {
    onAddScreenshot(thumbnail, 'display')
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

    fetchWindows()
    fetchDisplays()
  }, [])

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

  if (attachmentOptions && attachmentOptions?.length === 0) {
    return null
  }

  return (
    <>
      {attachmentOptions.map((option, index) => (
        <DropdownMenuItem key={index} onClick={option.onClick}>
          {option.imageComponent}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-secondary">{option.title}</span>
          </div>
        </DropdownMenuItem>
      ))}
    </>
  )
}
