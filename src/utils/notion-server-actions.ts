'use server'

import { NotionParentItem } from '@/types'
import { Client, isFullPage, isFullPageOrDatabase } from '@notionhq/client'
import { markdownToBlocks } from '@tryfabric/martian'

const HIGHLIGHT_BACKEND_BASE_URL = 'https://backend.highlightai.com'

/**
 * Returns the latest Notion API token for the given user by their ID.
 */
export async function getNotionTokenForUser(hlAccessToken: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/notion/token`, {
    headers: {
      Authorization: `Bearer ${hlAccessToken}`,
    },
  })

  if (response.status === 404) {
    // User doesn't have a Notion connection created yet.
    return null
  }

  if (!response.ok) {
    console.error('Failed to get Notion token for user. HTTP code:', response.status, await response.text())
    throw new Error('Failed to get Notion token for user.')
  }

  const data = await response.json()

  if (!data.token) {
    console.error('Failed to get Notion token for user. No token found in response body.')
    throw new Error('Failed to get Notion token for user. No token found in response body.')
  }

  return data.token as string
}

/**
 * Creates a magic sign in link for Notion.
 * We will redirect the user to this link to create a connection.
 */
export async function createMagicLinkForNotion(accessToken: string) {
  const response = await fetch(
    `${HIGHLIGHT_BACKEND_BASE_URL}/v1/auth/magiclink?redirect_uri=https://auth.highlight.ing/connect/notion`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    console.warn('Failed to create Notion connect link', response.status, await response.text())
    throw new Error('Failed to create Notion connect link')
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    console.warn('Failed to parse response as JSON', e, await response.text())
    throw e
  }

  return data.url
}

export async function checkNotionConnectionStatus(accessToken: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/notion`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.warn('Failed to check if Notion is connected', response.status, await response.text())
    throw new Error('Failed to check if Notion is connected')
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    console.warn('Failed to parse response as JSON', e, await response.text())
    throw e
  }

  return data.connected
}

/**
 * Gets the parent items (pages and databases) for the given Notion access token.
 * These are items that we can create a child (sub-page) for.
 */
export async function getNotionParentItems(accessToken: string) {
  const notion = new Client({
    auth: accessToken,
  })

  const response = await notion.search({})

  const fullResults = response.results.filter(isFullPageOrDatabase)

  const parentItems: NotionParentItem[] = []

  fullResults.forEach((result) => {
    if (result.object === 'database') {
      parentItems.push({
        type: result.object,
        id: result.id,
        title: result.title,
      })
      return
    }

    console.log(result)

    for (const property of Object.values(result.properties)) {
      if (property.type === 'title' && Array.isArray(property.title)) {
        parentItems.push({
          type: result.object,
          id: result.id,
          title: property.title,
        })
      }
    }
  })

  return parentItems
}

interface CreateNotionPageParams {
  accessToken: string
  parent: NotionParentItem
  title: string
  content: string
}

/**
 * Creates a new Notion page with the given title and content.
 * @returns the URL of the created page, or null if it failed
 */
export async function createNotionPage({ accessToken, parent, title, content }: CreateNotionPageParams) {
  const notion = new Client({
    auth: accessToken,
  })

  const blocks = markdownToBlocks(content, {
    notionLimits: {
      onError: (err) => {
        console.error('Error converting markdown to blocks', err)
      },
    },
  })

  // TS bs, so stupid
  type IdRequest = string | string
  const apiParent:
    | {
        page_id: IdRequest
        type?: 'page_id'
      }
    | {
        database_id: IdRequest
        type?: 'database_id'
      } =
    parent.type === 'page' ? { type: 'page_id', page_id: parent.id } : { type: 'database_id', database_id: parent.id }

  const response = await notion.pages.create({
    parent: apiParent,
    properties: {
      title: {
        title: [{ text: { content: title } }],
      },
    },
    //@ts-ignore
    children: blocks,
  })

  if (!isFullPage(response)) {
    console.warn('Notion returned a non-full page', response)
    return null
  }

  return response.url
}
