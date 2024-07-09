'use client'

import { AuthContextProvider } from './context/AuthContext'
import { InputContextProvider } from './context/InputContext'
import HighlightChat from './main'

export default function Home() {
  return (
    <div className="flex min-h-screen max-h-dvh justify-center bg-[#rgba(13, 13, 13, 1)]">
      <AuthContextProvider>
        <InputContextProvider>
          <HighlightChat />
        </InputContextProvider>
      </AuthContextProvider>
    </div>
  )
}
