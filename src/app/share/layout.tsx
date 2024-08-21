import React from 'react'
import { Inter } from 'next/font/google'
import styles from '@/main.module.scss'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body>
        <div className={`${styles.page} bg-background flex min-h-screen flex-col`}>
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  )
}
