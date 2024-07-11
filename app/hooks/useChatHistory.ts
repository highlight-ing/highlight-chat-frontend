import { useAuthContext } from '../context/AuthContext'
import {useEffect, useState} from "react";

export const useChatHistory = () => {
  const { accessToken, refreshAccessToken } = useAuthContext()
  const [ chatHistory, setChatHistory ] = useState([])

  const fetchResponse = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:8080/'
      const requestUrl = `${backendUrl}chat-history`
      let response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 401) {
        // Token has expired, refresh it
        await refreshAccessToken()
        // Retry the request with the new token
        response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      }

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      console.log('chat history:', data)
      setChatHistory(data)
    } catch (error) {
      console.error('Error fetching response:', error)
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchResponse()
    }
  }, [accessToken])

  return chatHistory
}
