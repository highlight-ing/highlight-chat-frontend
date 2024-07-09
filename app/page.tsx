'use client'

import { InputContextProvider } from './context/InputContext'
import HighlightChat from './main'

export default function Home() {
  return (
    <main className="flex min-h-screen justify-center bg-[#rgba(13, 13, 13, 1)]">
      <InputContextProvider>
        <HighlightChat />
      </InputContextProvider>
    </main>
  )
}
