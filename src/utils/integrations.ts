import { IntegrationType } from '@/types'
import { getLinearTokenForUser } from './linear-server-actions'

export function getIntegrationLanguage(type: IntegrationType) {
  switch (type) {
    case 'linear':
      return 'Linear'
  }
}

export async function createLinearTicket(accessToken: string, title: string) {
  // Check to see if the user has a linear integration

  const linearToken = await getLinearTokenForUser(accessToken)
}
