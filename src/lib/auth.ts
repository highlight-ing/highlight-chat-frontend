import { JWTPayload, jwtVerify, JWTVerifyResult } from 'jose'

/**
 * Validates a JWT from the Highlight auth service.
 */
export async function validateHighlightJWT(jwt: string) {
  const jwtSecret = process.env.HIGHLIGHT_AUTH_JWT_SECRET
  if (!jwtSecret) {
    throw new Error('HIGHLIGHT_AUTH_JWT_SECRET environment variable is not set')
  }

  return await jwtVerify(jwt, new TextEncoder().encode(jwtSecret))
}

/**
 * Extracts a Bearer token from the headers object.
 * @author ChatGPT
 */
export function extractBearerToken(headers: Headers): string | null {
  // Get the Authorization header from the headers object
  const authHeader = headers.get('Authorization') || headers.get('authorization')

  // Check if the Authorization header exists and starts with 'Bearer'
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract and return the token part after 'Bearer '
    return authHeader.slice(7).trim()
  }

  // Return null if the Bearer token is not found
  return null
}

export async function validateUserAuth(authToken: string) {
  let jwt: JWTVerifyResult<JWTPayload>

  try {
    jwt = await validateHighlightJWT(authToken)
  } catch (error) {
    throw new Error('Invalid auth token')
  }

  const userId = jwt.payload.sub

  if (!userId) {
    throw new Error('User ID not found in auth token')
  }

  return userId
}
