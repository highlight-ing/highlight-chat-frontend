export const appVersion = typeof window !== 'undefined' ? window.highlight?.version : undefined
export const isDevelopment = process.env.NODE_ENV === 'development'
// export const isAlpha = !isDevelopment && appVersion?.endsWith('alpha')
export const isAlpha = true
