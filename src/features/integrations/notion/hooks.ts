import { useMutation, useQuery } from '@tanstack/react-query'
import { getNotionTokenForUser, getNotionParentItems, createNotionPage, checkNotionConnectionStatus } from './actions'
import { NotionPageFormSchema } from './notion'

export function useNotionApiToken() {
  return useQuery({
    queryKey: ['notion-api-token'],
    queryFn: async () => {
      // @ts-expect-error: highlight is mounted on window
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string
      const token = await getNotionTokenForUser(hlToken as string)

      if (!token) {
        console.warn('Something is wrong, no Notion token found for user but we are in the Notion form')
        throw new Error('No Notion token found')
      }

      return { notionToken: token, hlToken }
    },
  })
}

export function useNotionParentItems() {
  const { data: tokenData } = useNotionApiToken()
  const notionToken = tokenData?.notionToken

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
  const { data: tokenData } = useNotionApiToken()
  const hlToken = tokenData?.hlToken

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

export function useCreateNotionPage(onSubmitSuccess: (url: string | undefined) => void) {
  const { data: tokenData } = useNotionApiToken()
  const { data: parentItems } = useNotionParentItems()
  const notionToken = tokenData?.notionToken

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
