const appVersion = typeof window !== 'undefined' ? window.highlight?.version : undefined
const isDevelopment = process.env.NODE_ENV === 'development'

export const isAlpha = !isDevelopment && appVersion?.endsWith('alpha')

export const backendUrl = isAlpha
  ? 'https://chat-backend.highlightai.com'
  : (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8787')
