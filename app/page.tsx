'use client'

import { AuthContextProvider } from './context/AuthContext'
import { HighlightContextContextProvider } from './context/HighlightContext'
import { InputContextProvider } from './context/InputContext'
import { MessagesContextProvider } from './context/MessagesContext'
import HighlightChat from './main'

export default function Home() {
  return (
    <AuthContextProvider>
      <HighlightContextContextProvider>
        <MessagesContextProvider>
          <InputContextProvider>
            <HighlightChat />
          </InputContextProvider>
        </MessagesContextProvider>
      </HighlightContextContextProvider>
    </AuthContextProvider>
  )
}
