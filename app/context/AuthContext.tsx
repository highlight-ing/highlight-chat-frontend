import React, { createContext, useContext, useEffect, useState } from 'react'
import Highlight from '@highlight-ai/app-runtime'
import { Attachment } from '../types/types'

interface AuthContextProps {
  refreshAccessToken: () => Promise<string>
  getAccessToken: () => Promise<string>
  accessToken?: string
}

const initialContext: AuthContextProps = {
  refreshAccessToken: async () => '',
  getAccessToken: async () => '',
  accessToken: undefined
}

export const AuthContext = createContext<AuthContextProps>(initialContext)

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

  const refreshAccessToken = async (): Promise<string> => {
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
      return newAccessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw error
    }
  }

  const getAccessToken = async (): Promise<string> => {
    if (!accessToken) {
      // If there's no accessToken, wait for it to be set
      return new Promise((resolve) => {
        const checkToken = setInterval(() => {
          if (accessToken) {
            clearInterval(checkToken)
            resolve(accessToken)
          }
        }, 100)
      })
    }
    return accessToken
  }

  return (
    <AuthContext.Provider value={{ accessToken, refreshAccessToken, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  return useContext(AuthContext)
}