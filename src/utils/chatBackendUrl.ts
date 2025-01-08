import { isAlpha } from './appVersion'

export const backendUrl = isAlpha
  ? 'https://chat-backend-staging.highlight.ing'
  : (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080')

// export const backendUrl = 'http://localhost:8787'
