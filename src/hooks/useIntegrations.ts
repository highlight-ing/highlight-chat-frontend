import { getLinearTokenForUser } from '@/utils/linear-server-actions'
import useAuth from './useAuth'
import { useStore } from '@/providers/store-provider'

export interface UseIntegrationsAPI {
  createLinearTicket: (title: string) => Promise<void>
}

export function useIntegrations(): UseIntegrationsAPI {
  const { getAccessToken } = useAuth()
  const openModal = useStore((state) => state.openModal)

  async function createLinearTicket(title: string) {
    // Check to see if the user has setup Linear integration
    const linearToken = await getLinearTokenForUser(await getAccessToken())

    if (linearToken === null) {
      // The user hasn't connected linear, we should show the connection modal.
      openModal('connect-integration', { type: 'linear' })
      return
    }

    if (typeof linearToken !== 'string') {
      console.warn('Error getting linear token for user', linearToken?.error)
      return
    }

    console.log('useIntegrations hook called', title)
  }

  return { createLinearTicket }
}
