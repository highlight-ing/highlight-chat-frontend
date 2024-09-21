import { useStore } from '@/providers/store-provider'
import Highlight from '@highlight-ai/app-runtime'

import styles from './attachment-picker.module.scss'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/utils/amplitude'
import { ArrowCircleLeft, CloseCircle } from 'iconsax-react'
import { Portal } from 'react-portal'

export interface AttachmentOption {
  imageComponent: ReactElement
  title: string
  description: string
  onClick: () => void
}

interface AttachmentPickerProps {
  isVisible: boolean
  header: string
  attachmentOptions: AttachmentOption[]
  onClose: () => void
  onBack: () => void
}

export const AttachmentPicker = ({ isVisible, onClose, onBack, header, attachmentOptions }: AttachmentPickerProps) => {
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

  const onAddScreenshot = async (screenshot: string, source: 'display' | 'window') => {
    if (screenshot.length > 0) {
      addAttachment({
        type: 'image',
        value: screenshot,
      })
      trackEvent('HL Chat Screenshot Attached', { source })
    }
  }

  return (
    <div ref={containerRef}>
      <Portal>
        {isVisible && (
          <div ref={portalRef} className={styles.innerContainer} style={{ ...portalStyles }}>
            <div className={styles.header}>
              <ArrowCircleLeft variant="Bold" size={24} onClick={onBack} style={{ cursor: 'pointer' }} />
              <span>{header}</span>
              <CloseCircle variant="Bold" size={24} onClick={onClose} style={{ cursor: 'pointer' }} />
            </div>
            <div className={styles.rows}>
              {attachmentOptions.map((option, index) => (
                <div className={styles.row} key={index} onClick={option.onClick}>
                  {option.imageComponent}
                  <div className={styles.textContainer}>
                    <span className={styles.title}>{option.title}</span>
                    <span className={styles.description}>{option.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Portal>
    </div>
  )
}
