import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getNotionTokenForUser,
  getNotionParentItems,
  createNotionPage,
  checkNotionConnectionStatus,
  createMagicLinkForNotion,
} from './actions'
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

export function useCreateNotionPage(onSubmitSuccess: (url: string | undefined) => void) {
  const { data: token } = useNotionApiToken()

  return useMutation({
    mutationKey: ['create-linear-ticket'],
    mutationFn: async (input: { formData: NotionPageFormSchema; contentWithFooter: string }) => {
      if (!token) {
        console.warn('Notion token not set, please try again later.')
        throw new Error('No Notion token available')
      }

      if (!input.formData?.parent) {
        throw new Error('Parent item not selected')
      }

      const response = await createNotionPage({
        accessToken: token,
        parent: input.formData.parent,
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
