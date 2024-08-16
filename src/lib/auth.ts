import { jwtVerify } from 'jose'

/**
 * Validates a JWT from the Highlight auth service.
 */
export async function validateHighlightJWT(jwt: string) {
  const jwtSecret = process.env.HIGHLIGHT_AUTH_JWT_SECRET
  if (!jwtSecret) {
    throw new Error('HIGHLIGHT_AUTH_JWT_SECRET is not set')
  }

  return await jwtVerify(jwt, new TextEncoder().encode(jwtSecret))
}
