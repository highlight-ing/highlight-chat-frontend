import { useMutation, useQuery } from '@tanstack/react-query'
import { getNotionTokenForUser, getNotionParentItems, createNotionPage, checkNotionConnectionStatus } from './actions'
import { NotionPageFormSchema } from './notion'

const TWO_MINUTES_IN_MILLI = 120000

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

      return token
    },
    staleTime: TWO_MINUTES_IN_MILLI,
  })
}

export function useNotionParentItems() {
  const { data: token } = useNotionApiToken()

  return useQuery({
    queryKey: ['notion-parent-items', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('No Notion token available')
      }

      const items = await getNotionParentItems(token)

      return items
    },
    enabled: !!token,
  })
}

export function useCheckNotionConnection() {
  const { data: token } = useNotionApiToken()

  return useQuery({
    queryKey: ['notion-check-connection'],
    queryFn: async () => {
      if (!token) {
        throw new Error('No Notion token available')
      }

      const connected = await checkNotionConnectionStatus(token)

      return connected as boolean
    },
    enabled: !!token,
    staleTime: TWO_MINUTES_IN_MILLI,
  })
}

export function useCreateNotionPage(onSubmitSuccess: (url: string | undefined) => void) {
  const { data: token } = useNotionApiToken()
  const { data: parentItems } = useNotionParentItems()

  return useMutation({
    mutationKey: ['create-notion-page'],
    mutationFn: async (input: { formData: NotionPageFormSchema; contentWithFooter: string }) => {
      if (!token) {
        console.warn('Notion token not set, please try again later.')
        throw new Error('No Notion token available')
      }

      const parentItem = parentItems?.find((item) => item.id === input.formData.parentId)

      if (!parentItem) {
        throw new Error('Parent item not found')
      }

      const response = await createNotionPage({
        accessToken: token,
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
