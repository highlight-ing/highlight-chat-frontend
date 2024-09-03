import { refreshTokens } from '@/app/(app)/actions'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  refreshToken: z.string(),
})

/**
 * POST request to refresh the access token.
 *
 * This is used by Electron to refresh the HL Chat access token.
 */
export async function POST(req: Request) {
  const body = await req.json()

  const validated = schema.safeParse(body)

  if (!validated.success) {
    return new Response('Invalid request body.', { status: 400 })
  }

  const { refreshToken } = validated.data

  const tokens = await refreshTokens(refreshToken)

  return NextResponse.json(tokens)
}
