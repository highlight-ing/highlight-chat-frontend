import type { User, WorkflowState } from '@linear/sdk'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { HIGHLIGHT_BACKEND_BASE_URL } from '@/lib/integrations-backend'

import { useHighlightToken } from '../_hooks/use-hl-token'
import { checkLinearConnectionStatus } from './actions'
import { LinearTicketFormSchema } from './linear'

export function useCheckLinearConnection() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['linear-check-connection'],
    queryFn: async () => {
      if (!hlToken) {
        throw new Error('No Linear token available')
      }

      const connected = await checkLinearConnectionStatus(hlToken)

      return connected as boolean
    },
    enabled: !!hlToken,
  })
}

interface LinearStatusesResponse {
  statuses: WorkflowState[]
}

export function useLinearWorkflowStates() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['linear-workflow-states'],
    queryFn: async () => {
      if (!hlToken) {
        throw new Error('No Highlight token available')
      }

      const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/linear/statuses`, {
        headers: {
          Authorization: `Bearer ${hlToken}`,
        },
      })

      if (!response.ok) {
        const responseText = await response.text()
        throw new Error(`Failed to fetch Linear statuses: ${responseText}`)
      }

      const data = (await response.json()) as LinearStatusesResponse

      return data.statuses.sort((a, b) => a.position - b.position)
    },
    enabled: !!hlToken,
    staleTime: 2 * 60 * 1000,
  })
}

interface LinearAssigneesResponse {
  assignees: User[]
}

export function useLinearAssignees() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['linear-assignees'],
    queryFn: async () => {
      if (!hlToken) {
        throw new Error('No Highlight token available')
      }

      const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/linear/assignees`, {
        headers: {
          Authorization: `Bearer ${hlToken}`,
        },
      })

      const data = (await response.json()) as LinearAssigneesResponse

      return data.assignees
    },
    enabled: !!hlToken,
    staleTime: 2 * 60 * 1000,
  })
}

interface CreateLinearTicketResponse {
  url: string
}

export function useCreateLinearTicket(onSubmitSuccess: ((url: string) => void) | undefined) {
  const { data: hlToken } = useHighlightToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-linear-ticket'],
    mutationFn: async (input: LinearTicketFormSchema) => {
      if (!hlToken) {
        throw new Error('No Highlight token available')
      }

      const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/linear/ticket`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hlToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          assignee: input.assignee,
          status: input.status,
        }),
      })

      if (!response.ok) {
        const responseText = await response.text()
        throw new Error(`Failed to create Linear ticket: ${responseText}`)
      }

      const data = (await response.json()) as CreateLinearTicketResponse

      return data.url
    },
    onSuccess: (issueUrl) => {
      if (onSubmitSuccess) onSubmitSuccess(issueUrl)
    },
    onError: (error) => {
      if (error.message.includes('Not connected')) {
        queryClient.invalidateQueries({ queryKey: ['linear-check-connection'] })
      }
      console.warn(error.message)
    },
  })
}
