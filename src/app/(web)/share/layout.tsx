import React from 'react'
import styles from '@/main.module.scss'

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.page} flex min-h-screen flex-col bg-primary`}>
      <main className="flex-grow">{children}</main>
    </div>
  )
}
