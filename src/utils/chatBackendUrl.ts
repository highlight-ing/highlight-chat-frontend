import { isAlpha } from './appVersion'

export const backendUrl = isAlpha
  ? 'https://chat-backend.highlightai.com'
  : (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8787')
