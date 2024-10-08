/**
 * Most of the integrations require auth, this file contains a unified auth component that can be used for each integration.
 */

import { useEffect, useState } from 'react'
import Button from '../Button/Button'

/**
 * @param name - The name of the integration
 * @param checkConnectionStatus - A function that checks the connection status
 * @param onConnect - A function that is called when the connection is successful
 * @param icon - The icon of the integration
 * @param createMagicLink - A function that creates a magic link to redirect the user to the integration's auth page
 */
export function SetupConnectionComponent({
  name,
  checkConnectionStatus,
  onConnect,
  icon,
  createMagicLink,
}: {
  name: string
  checkConnectionStatus: (token: string) => Promise<boolean>
  createMagicLink: (token: string) => Promise<string>
  onConnect: () => void
  icon: React.ReactNode
}) {
  const [connectLink, setConnectLink] = useState<string>('')
  const [connectClicked, setConnectClicked] = useState(false)

  async function _checkConnectionStatus() {
    // @ts-ignore
    const hlToken = (await highlight.internal.getAuthorizationToken()) as string

    const connected = await checkConnectionStatus(hlToken)

    if (connected) {
      onConnect()
    }
  }

  useEffect(() => {
    if (connectClicked) {
      // Create an interval that checks the connection status every 5 seconds
      const interval = setInterval(() => {
        _checkConnectionStatus()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [connectClicked])

  useEffect(() => {
    async function getConnectLink() {
      // Fetch the latest Highlight authorization token (only available to Highlight Chat)
      try {
        // @ts-ignore
        const token = (await highlight.internal.getAuthorizationToken()) as string

        const connectLink = await createMagicLink(token)
        setConnectLink(connectLink)
      } catch (e) {
        console.warn('Error getting authorization token', e)
        return
      }
    }

    getConnectLink()
  }, [])

  return (
    <div className="mt-2 flex flex-col gap-2">
      <p>You'll need to connect your {name} account first.</p>
      <Button
        disabled={!connectLink}
        size="small"
        variant="primary-outline"
        onClick={() => {
          setConnectClicked(true)
          window.open(connectLink, '_blank')
        }}
      >
        {icon} Connect {name}
      </Button>

      <small onClick={_checkConnectionStatus} className="cursor-pointer underline">
        Check connection status
      </small>
    </div>
  )
}
