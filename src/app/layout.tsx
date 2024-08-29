import { Metadata } from 'next'
import { DM_Mono, Inter } from 'next/font/google'

import './globals.css'

export const metadata: Metadata = {
  title: 'Highlight Chat',
  description: 'Chat with Highlight',
}

const dmMono = DM_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-mono',
})

const inter = Inter({
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmMono.variable} ${inter.className} dark`}>
      <body>{children}</body>
    </html>
  )
}
