import createClient from 'openapi-fetch'

import type { paths } from '@/types/backend-schema'
import { backendUrl } from '@/utils/chatBackendUrl'

import { isAlpha } from './appVersion'

const client = createClient<paths>({
  baseUrl: isAlpha ? `${backendUrl}/api/v4` : backendUrl,
})

export default client
