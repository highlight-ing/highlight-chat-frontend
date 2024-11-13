const appVersion = typeof window !== 'undefined' ? window.highlight?.version : undefined
const isAlpha = appVersion?.endsWith('alpha')

export const backendUrl = isAlpha
  ? 'https://chat-backend-staging.highlight.ing'
  : (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080')
