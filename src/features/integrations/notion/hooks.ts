import { useMutation, useQuery } from '@tanstack/react-query'

import { useHighlightToken } from '../_hooks/use-hl-token'
import { checkNotionConnectionStatus, createNotionPage, getNotionParentItems, getNotionTokenForUser } from './actions'
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

export function useNotionParentItems() {
  const { data: notionToken } = useNotionApiToken()

  return useQuery({
    queryKey: ['notion-parent-items', notionToken],
    queryFn: async () => {
      if (!notionToken) {
        throw new Error('No Notion token available')
      }

      const items = await getNotionParentItems(notionToken)

      return items
    },
    enabled: !!notionToken,
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
    refetchInterval: 7 * 1000,
    retry: false,
  })
}

export function useCreateNotionPage(onSubmitSuccess: (url: string | undefined) => void) {
  const { data: notionToken } = useNotionApiToken()
  const { data: parentItems } = useNotionParentItems()

  return useMutation({
    mutationKey: ['create-notion-page'],
    mutationFn: async (input: { formData: NotionPageFormSchema; contentWithFooter: string }) => {
      if (!notionToken) {
        console.warn('Notion token not set, please try again later.')
        throw new Error('No Notion token available')
      }

      const parentItem = parentItems?.find((item) => item.id === input.formData.parentId)

      if (!parentItem) {
        throw new Error('Parent item not found')
      }

      const response = await createNotionPage({
        accessToken: notionToken,
        parent: parentItem,
        title: input.formData.title,
        content: input.contentWithFooter,
      })

      return response ?? undefined
    },
    onSuccess: (response) => {
      if (onSubmitSuccess) onSubmitSuccess(response)
    },
    onError: (error) => {
      console.warn(error.message)
    },
  })
}
