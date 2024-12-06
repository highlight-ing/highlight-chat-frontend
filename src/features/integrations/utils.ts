import { IntegrationType } from './types'

export function getIntegrationLanguage(type: IntegrationType) {
  switch (type) {
    case 'linear':
      return 'Linear'
    case 'notion':
      return 'Notion'
  }
}

export const integrationFunctionNames = [
  'create_linear_ticket',
  'create_notion_page',
  'create_google_calendar_event',
  'enable_agent_mode',
]
