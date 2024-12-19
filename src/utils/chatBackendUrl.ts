const appVersion = typeof window !== 'undefined' ? window.highlight?.version : undefined
const isDevelopment = process.env.NODE_ENV === 'development'
const isAlpha = !isDevelopment && appVersion?.endsWith('alpha')

export const backendUrl = isAlpha
  ? 'https://chat-backend-staging.highlight.ing'
  : (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8787')
