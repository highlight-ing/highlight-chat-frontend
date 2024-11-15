import { backendUrl } from '@/utils/chatBackendUrl'
import createClient from 'openapi-fetch'

import type { paths } from '@/types/backend-schema'

const client = createClient<paths>({
  baseUrl: backendUrl,
})

export default client
