'use client'

import { useStore } from '@/components/providers/store-provider'
import Toast from '@/components/Toast/Toast'

import styles from './toast.module.scss'

const ToastContainer = () => {
  const toasts = useStore((state) => state.toasts)
  return (
    <div className={styles.toastsContainer}>
      {toasts.map((toast) => {
        return <Toast key={toast.id} {...toast} />
      })}
    </div>
  )
}

export default ToastContainer
