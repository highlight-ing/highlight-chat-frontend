import Intercom from '@intercom/messenger-js-sdk'
import { useEffect } from 'react'

export default function IntercomChat() {
  useEffect(() => {
    if (window && window?.highlight) {
      const getUser = async () => {
        const highlightUserEmail = await window.highlight?.user?.getEmail()

        Intercom({
          app_id: 'wrpa50zk',
          name: highlightUserEmail,
        })
      }
      getUser()
    }
  }, [])

  return null
}
