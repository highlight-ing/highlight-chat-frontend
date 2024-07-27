import React, { PropsWithChildren, ReactElement, ReactNode, useEffect } from 'react'
import CloseButton from '@/components/CloseButton/CloseButton'

import styles from './modals.module.scss'

type SizeType = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen' | string

export interface ModalProps {
  id: string
  close?: () => void
  size: SizeType
  exitOnClick?: boolean
  exitOnEscape?: boolean
  bodyPadding?: string
  gap?: string
  header?: string | ReactElement | ReactNode
  zIndex?: number
  navigateOnClose?: boolean | 'home'
  navigateBackOrHome?: () => void
  showClose?: boolean
  position?: 'center' | 'top' | 'bottom'
  style?: React.CSSProperties
  scrollable?: boolean
  onClose?: (e: null | React.MouseEvent) => void
  bodyStyle?: React.CSSProperties
  overlayStyle?: React.CSSProperties
  bodyClassName?: string
}

interface BaseModalProps {
  closeModal: (id: string) => void
}

const BaseModal = ({
  id,
  children,
  size,
  style,
  header,
  exitOnClick,
  exitOnEscape,
  onClose,
  closeModal,
  navigateOnClose,
  navigateBackOrHome,
  position,
  bodyStyle,
  overlayStyle,
  showClose,
  bodyClassName,
}: PropsWithChildren<ModalProps & BaseModalProps>) => {
  const close = (e: null | React.MouseEvent, force?: boolean) => {
    // @ts-ignore
    const isTargetModalOverlay = e?.target?.id === id
    const shouldClose = isTargetModalOverlay || force
    if (shouldClose) {
      if (typeof closeModal === 'function') {
        closeModal(id)
      }

      if (typeof onClose === 'function') {
        onClose(e)
      }

      // for modals that are opened via routes, it should
      // navigate back or home when the modal is closed
      if (navigateOnClose && typeof navigateBackOrHome === 'function') {
        navigateBackOrHome()
      }
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (exitOnEscape === false) {
        return
      }
      if (e.key === 'Escape') {
        e.stopPropagation()
        close(null, true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  console.log('bodyClassName:', bodyClassName)

  return (
    <div
      className={`${styles.modalOverlay} ${position ?? ''}`}
      id={id}
      onClick={(e) => {
        if (exitOnClick !== false) {
          close(e)
        }
      }}
      style={overlayStyle}
    >
      <div className={`${styles.modalContainer} ${styles[size]}`} style={style}>
        {showClose !== false && <CloseButton onClick={(e) => close(e, true)} />}
        {header && <div className={styles.modalHeader}>{header}</div>}
        <div className={`${styles.modalBody} ${bodyClassName ?? ''}`} id={`${id}-body`} style={bodyStyle}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default BaseModal

