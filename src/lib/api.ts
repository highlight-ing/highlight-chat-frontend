import { SharedChat } from '@/types'
import { extractBearerToken, validateHighlightJWT } from './auth'
import { z } from 'zod'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/'

interface RequestOptions {
  version?: 'v1' | 'v3'
  signal?: AbortSignal
}

export const getSharedConversation = async (id: string, options?: RequestOptions): Promise<SharedChat | null> => {
  try {
    const response = await fetch(`${backendUrl}/api/${options?.version ?? 'v1'}/share-link/${id}`, {
      method: 'GET',
      signal: options?.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response not OK:', response.status, errorText)
      throw new Error(`Failed to fetch shared conversation: ${response.status} ${errorText}`)
    }

    const sharedChat: SharedChat = await response.json()
    return sharedChat
  } catch (error) {
    console.error('Error fetching shared conversation:', error)
    return null
  }
}

/**
 * Authenticates a Highlight Chat API user, returns either a Response that should be returned from the API route
 * or a user object if authentication was successful.
 */
export async function authenticateApiUser(request: Request) {
  const token = extractBearerToken(request.headers)

  if (!token) {
    // User didn't provide a token
    return Response.json({ error: 'Unauthorized, Bearer token is required.' }, { status: 401 })
  }

  let jwtResponse
  // Validate the JWT
  try {
    jwtResponse = await validateHighlightJWT(token)
  } catch (error) {
    return Response.json({ error: 'Unauthorized, invalid Bearer token.' }, { status: 401 })
  }

  return jwtResponse.payload
}

/**
 * Returns a Response if the provided string is not a valid UUID.
 */
export function validateIsUuid(uuid: string) {
  const uuidSchema = z.string().uuid()

  const result = uuidSchema.safeParse(uuid)

  if (!result.success) {
    return Response.json({ error: 'Bad Request, invalid UUID.' }, { status: 400 })
  }
}
