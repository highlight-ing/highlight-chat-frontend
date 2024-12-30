import { backendUrl } from '@/utils/chatBackendUrl'
import createClient from 'openapi-fetch'

import type { paths } from '@/types/backend-schema'

const client = createClient<paths>({
  baseUrl: `${backendUrl}/api/v4`,
})

export default client
