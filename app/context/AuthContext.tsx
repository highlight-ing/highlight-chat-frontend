import React, { createContext, useContext, useEffect, useState } from 'react'
import Highlight from '@highlight-ai/app-runtime'
import { Attachment } from '../types/types'

interface AuthContextProps {
  refreshAccessToken: () => Promise<void>
  accessToken?: string
}

export const AuthContext = createContext<AuthContextProps>({ refreshAccessToken: () => Promise.resolve() })

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined)
  const [refreshToken, setRefreshToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const { accessToken, refreshToken } = await Highlight.auth.signIn()
        setAccessToken(accessToken)
        setRefreshToken(refreshToken)
      } catch (error) {
        console.error('Authentication failed:', error)
      }
    }

    authenticateUser()
  }, [])

  const refreshAccessToken = async () => {
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const { accessToken: newAccessToken } = await response.json()
      setAccessToken(newAccessToken)
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
  }

  return <AuthContext.Provider value={{ accessToken, refreshAccessToken }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  return useContext(AuthContext)
}
