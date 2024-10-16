import createClient from 'openapi-fetch'
import type { paths } from '@/types/backend-schema'

const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
})

export default client
