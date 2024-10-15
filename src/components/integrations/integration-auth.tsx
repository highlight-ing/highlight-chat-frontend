/**
 * Most of the integrations require auth, this file contains a unified auth component that can be used for each integration.
 */

import { useEffect, useState } from 'react'
import Button from '@/components/Button/Button'

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

  async function _createMagicLink() {
    // Setting up a magic link requires that the user is logged in and has an email address setup
    // ensure this is the case.

    console.log('clicked created magic link')
    let checkResult

    try {
      // @ts-ignore
      checkResult = (await highlight.internal.validateEmailOrSetup()) as boolean
      console.log('checkResult', checkResult)
    } catch (e) {
      console.warn('Error ensuring user is logged in and has an email address', e)
      return
    }

    if (!checkResult) {
      console.warn('User is not logged in and/or dismissed the email setup')
      return
    }

    // Fetch the latest Highlight authorization token (only available to Highlight Chat)
    try {
      // @ts-ignore
      const token = (await highlight.internal.getAuthorizationToken()) as string

      const connectLink = await createMagicLink(token)
      setConnectClicked(true)
      window.open(connectLink, '_blank')
    } catch (e) {
      console.warn('Error getting authorization token', e)
      return
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p>You'll need to connect your {name} account first.</p>
      <Button size="small" variant="primary-outline" onClick={_createMagicLink}>
        {icon} Connect {name}
      </Button>

      <small onClick={_checkConnectionStatus} className="cursor-pointer underline">
        Check connection status
      </small>
    </div>
  )
}
