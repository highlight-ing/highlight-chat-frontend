import { getLinearTokenForUser } from '@/utils/linear-server-actions'
import useAuth from './useAuth'
import { useStore } from '@/providers/store-provider'
import { useEffect } from 'react'
import Button from '@/components/Button/Button'

export interface UseIntegrationsAPI {
  createLinearTicket: (conversationId: string, title: string) => Promise<void>
}

function LinearConnectionComponent() {
  return (
    <div className="flex flex-col gap-2">
      <div className="gap-.5 flex flex-col">
        <p className="text-lg">Connect Linear Account</p>
        <p>You'll need to connect your Linear account to continue.</p>
      </div>
      <Button size="small" variant="secondary" onClick={() => {}}>
        Connect Linear
      </Button>
    </div>
  )
}

export function useIntegrations(): UseIntegrationsAPI {
  const { getAccessToken } = useAuth()
  const openModal = useStore((state) => state.openModal)

  const addConversationMessage = useStore((state) => state.addConversationMessage)

  async function createLinearTicket(conversationId: string, title: string) {
    // Check to see if the user has setup Linear integration
    const linearToken = await getLinearTokenForUser(await getAccessToken())

    console.log('Conversation ID', conversationId)
    addConversationMessage(conversationId!, {
      content: <LinearConnectionComponent />,
      role: 'assistant',
    })

    if (linearToken === null) {
      // The user hasn't connected linear, we should show the connection modal.
      //   openModal('connect-integration', { type: 'linear' })
      addConversationMessage(conversationId!, {
        content: 'Creating ticket in Linear...',
        role: 'assistant',
      })
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
