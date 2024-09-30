import styles from './attachment-picker.module.scss'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { ArrowCircleLeft, CloseCircle } from 'iconsax-react'
import { Portal } from 'react-portal'
import { calculatePositionedStyle } from '@/utils/components'
import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'

export interface AttachmentOption {
  imageComponent: ReactElement
  title: string
  description?: string
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

  const containerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const messages = useCurrentChatMessages()

  useEffect(() => {
    function handleResize() {
      if (!containerRef.current || !portalRef.current) {
        return
      }
      const styles = calculatePositionedStyle(
        containerRef.current,
        portalRef.current,
        messages.length > 0 ? 'top' : 'bottom',
        20,
      )
      setPortalStyles(styles)
    }

    handleResize()
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
                    {option.description && <span className={styles.description}>{option.description}</span>}
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
