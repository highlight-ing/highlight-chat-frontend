import React, { useEffect, useRef, useState } from 'react'
import { type Toast } from '@/types'
import styles from './toast.module.scss'
import { useStore } from '@/components/providers/store-provider'
import CloseButton from '@/components/CloseButton/CloseButton'
import Button from '../Button/Button'

const Toast: React.FC<React.PropsWithChildren<Toast>> = ({ children, onClose, ...toast }) => {
  const removeToast = useStore((state) => state.removeToast)
  const [show, setShow] = useState(false)
  const [isShowing, setIsShowing] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (!show) {
      return
    }
    // Only execute once for transform, not all transitioning props
    if (e.propertyName !== 'transform') {
      return
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    if (isShowing) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = undefined
        setIsShowing(false)
      }, toast.timeout)
    } else {
      removeToast(toast.id)
    }
  }

  const _onClose = () => {
    if (onClose) {
      onClose()
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    setIsShowing(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        removeToast(toast.id)
      }
    }
  }, [isShowing])

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    if (!show) {
      timeout = setTimeout(() => {
        setShow(true)
      }, 100)
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [show])

  return (
    <div
      className={`${styles.toast} ${styles[toast.type ?? 'default']} ${show && isShowing ? styles.show : styles.hide}`}
      onTransitionEnd={show ? onTransitionEnd : undefined}
    >
      <div className={'flex flex-col'}>
        {toast.title && <span className={styles.title}>{toast.title}</span>}
        {toast.subtext && <span className={styles.subtext}>{toast.subtext}</span>}
      </div>
      {toast.description && <span className={styles.description}>{toast.description}</span>}
      {children}
      {toast.action && (
        <div className={styles.actions}>
          <Button onClick={toast.action.onClick} size="medium" variant={toast.action.variant ?? 'secondary'}>
            {toast.action.label ?? 'Got It'}
          </Button>
        </div>
      )}
      <CloseButton position={'8px'} onClick={_onClose} />
    </div>
  )
}

export default Toast
