const appVersion = typeof window !== 'undefined' ? window.highlight?.version : undefined
const isAlpha = appVersion?.endsWith('alpha')

export const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (isAlpha ? 'https://chat-backend-staging.highlight.ing' : 'http://localhost:8080')
