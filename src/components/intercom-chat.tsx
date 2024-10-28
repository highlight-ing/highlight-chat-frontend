import Intercom from '@intercom/messenger-js-sdk'
import { useEffect, useState } from 'react'

export default function IntercomChat() {
  const [userEmail, setUserEmail] = useState('')
  useEffect(() => {
    if (window && window?.highlight) {
      const getUser = async () => {
        const highlightUserEmail = await window.highlight?.user?.getEmail()
        setUserEmail(highlightUserEmail)
      }
      getUser()
    }
  }, [setUserEmail])

  Intercom({
    app_id: 'ibrkc80g',
    // email: userEmail,
    // user_id: user.id, // IMPORTANT: Replace "user.id" with the variable you use to capture the user's ID
    // created_at: user.createdAt, // IMPORTANT: Replace "user.createdAt" with the variable you use to capture the user's sign-up date
  })

  return null
}
