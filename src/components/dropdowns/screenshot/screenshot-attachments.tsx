import { useStore } from '@/components/providers/store-provider'
import Highlight from '@highlight-ai/app-runtime'
import styles from './screenshot.module.scss'
import { useEffect, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

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
    return (
      <>
        <div className="relative mt-1 flex cursor-pointer select-none items-center gap-2 rounded-[16px] border border-tertiary p-1 text-sm outline-none transition-colors first:mt-0 hover:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
          <Skeleton className={`${styles.image} ${styles.displayImage}`} />
          <Skeleton className="h-3.5 w-1/3 rounded-sm bg-hover" />
        </div>
        <div className="relative mt-1 flex cursor-pointer select-none items-center gap-2 rounded-[16px] border border-tertiary p-1 text-sm outline-none transition-colors first:mt-0 hover:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
          <Skeleton className={`${styles.image} ${styles.displayImage}`} />
          <Skeleton className="h-3.5 w-1/3 rounded-sm bg-hover" />
        </div>
        <div className="relative mt-1 flex cursor-pointer select-none items-center gap-2 rounded-[16px] border border-tertiary p-1 text-sm outline-none transition-colors first:mt-0 hover:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
          <Skeleton className={`${styles.image} ${styles.displayImage}`} />
          <Skeleton className="h-3.5 w-1/3 rounded-sm bg-hover" />
        </div>
      </>
    )
  }

  return (
    <ScrollArea className="h-[276px] w-full">
      {attachmentOptions.map((option, index) => (
        <div
          key={index}
          onClick={option.onClick}
          className="relative mt-1 flex cursor-pointer select-none items-center gap-2 rounded-[16px] border border-tertiary p-1 text-sm outline-none transition-colors first:mt-0 hover:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0"
        >
          {option.imageComponent}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-secondary">{option.title}</span>
          </div>
        </div>
      ))}
    </ScrollArea>
  )
}
