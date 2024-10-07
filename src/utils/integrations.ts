import { IntegrationType } from '@/types'

export function getIntegrationLanguage(type: IntegrationType) {
  switch (type) {
    case 'linear':
      return 'Linear'
  }
}
