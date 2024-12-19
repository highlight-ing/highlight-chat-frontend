import { NotionParentItem } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { HIGHLIGHT_BACKEND_BASE_URL } from '@/lib/integrations-backend'

import { useHighlightToken } from '../_hooks/use-hl-token'
import { checkNotionConnectionStatus, getNotionTokenForUser } from './actions'
import { NotionPageFormSchema } from './notion'

export function useNotionApiToken() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['notion-api-token'],
    queryFn: async () => {
      const notionToken = await getNotionTokenForUser(hlToken as string)

      if (!notionToken) {
        console.warn('Something is wrong, no Notion token found for user but we are in the Notion form')
        throw new Error('No Notion token found')
      }

      return notionToken
    },
    enabled: !!hlToken,
  })
}

interface NotionParentResponse {
  parents: NotionParentItem[]
}

export function useNotionParentItems() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['notion-parent-items'],
    queryFn: async () => {
      if (!hlToken) {
        throw new Error('No Highlight token available')
      }

      const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/notion/parents`, {
        headers: {
          Authorization: `Bearer ${hlToken}`,
        },
      })

      if (!response.ok) {
        const responseText = await response.text()
        throw new Error(`Failed to fetch parent items: ${responseText}`)
      }

      const items = (await response.json()) as NotionParentResponse

      return items.parents
    },
    enabled: !!hlToken,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCheckNotionConnection() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['notion-check-connection'],
    queryFn: async () => {
      if (!hlToken) {
        throw new Error('No Notion token available')
      }

      const connected = await checkNotionConnectionStatus(hlToken)

      return connected as boolean
    },
    enabled: !!hlToken,
  })
}

interface CreateNotionPageResponse {
  url: string
}

export function useCreateNotionPage(onSubmitSuccess: (url: string | undefined) => void) {
  const { data: parentItems } = useNotionParentItems()
  const { data: hlToken } = useHighlightToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-notion-page'],
    mutationFn: async (input: { formData: NotionPageFormSchema; contentWithFooter: string }) => {
      if (!hlToken) {
        throw new Error('No Highligh token available')
      }

      const connected = await checkNotionConnectionStatus(hlToken)

      if (!connected) {
        throw new Error('Not connected to Notion')
      }

      const parentItem = parentItems?.find((item: any) => item.id === input.formData.parentId)

      if (!parentItem) {
        throw new Error('Parent item not found')
      }

      const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/notion/page`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hlToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent: {
            type: parentItem.type,
            id: parentItem.id,
          },
          title: input.formData.title,
          content: input.contentWithFooter,
        }),
      })

      if (!response.ok) {
        const responseText = await response.text()
        throw new Error(`Failed to create Notion page: ${responseText}`)
      }

      const data = (await response.json()) as CreateNotionPageResponse

      return data.url ?? undefined
    },
    onSuccess: (response) => {
      if (onSubmitSuccess) onSubmitSuccess(response)
    },
    onError: (error) => {
      if (error.message.includes('Not connected')) {
        queryClient.invalidateQueries({ queryKey: ['notion-check-connection'] })
      }
      console.warn(error.message)
    },
  })
}
