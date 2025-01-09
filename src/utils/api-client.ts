import createClient from 'openapi-fetch'

import type { paths } from '@/types/backend-schema'
import { backendUrl } from '@/utils/chatBackendUrl'

const client = createClient<paths>({
  baseUrl: `${backendUrl}/api/v4`,
})

export default client
