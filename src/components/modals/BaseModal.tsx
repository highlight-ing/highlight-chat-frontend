import React, { PropsWithChildren, ReactElement, ReactNode, useEffect } from 'react'
import CloseButton from '@/components/CloseButton/CloseButton'
import LoadingModal from '@/components/modals/LoadingModal'

import styles from './modals.module.scss'
import { useStore } from '@/providers/store-provider'

type SizeType = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen' | string

export interface ModalProps {
  id: string
  isLoading?: boolean
  close?: () => void
  size: SizeType
  exitOnClick?: boolean
  exitOnEscape?: boolean
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
  closeButtonAlignment?: 'left' | 'right'
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
  isLoading,
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
  closeButtonAlignment,
  bodyClassName,
}: PropsWithChildren<ModalProps & BaseModalProps>) => {
  const modals = useStore((state) => state.modals)

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
      if (modals?.[modals.length - 1]?.id !== id) {
        return
      }
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        // e.stopPropagation()
        close(null, true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [modals])

  return (
    <div
      id={id}
      className={`${styles.modalOverlay} ${position ? styles[position] : ''}`}
      onClick={(e) => {
        if (exitOnClick !== false) {
          close(e)
        }
      }}
      style={overlayStyle}
    >
      <div className={`${styles.modalContainer} ${styles[size]}`} style={style}>
        {showClose !== false && <CloseButton onClick={(e) => close(e, true)} alignment={closeButtonAlignment} />}
        {header && <div className={styles.modalHeader}>{header}</div>}
        <div className={`${styles.modalBody} ${bodyClassName ?? ''}`} id={`${id}-body`} style={bodyStyle}>
          {isLoading ? <LoadingModal /> : children}
        </div>
      </div>
    </div>
  )
}

export default BaseModal
