import { LinearClient } from '@linear/sdk'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useHighlightToken } from '../_hooks/use-hl-token'
import { checkLinearConnectionStatus, getLinearTokenForUser } from './actions'
import { LinearTicketFormSchema } from './linear'

export function useLinearApiToken() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['linear-api-token'],
    queryFn: async () => {
      const linearToken = await getLinearTokenForUser(hlToken as string)

      if (!linearToken) {
        console.warn('Something is wrong, no Linear token found for user but we are in the Linear form')
        throw new Error('No Linear token found')
      }

      return linearToken
    },
    enabled: !!hlToken,
  })
}

export function useLinearClient() {
  const { data: linearToken } = useLinearApiToken()

  return useQuery({
    queryKey: ['linear-client', linearToken],
    queryFn: () => new LinearClient({ accessToken: linearToken }),
    enabled: !!linearToken,
    staleTime: Infinity,
  })
}

export function useLinearTeams() {
  const { data: client } = useLinearClient()

  return useQuery({
    queryKey: ['linear-teams'],
    queryFn: async () => {
      if (!client) {
        throw new Error('No Linear client available')
      }

      const me = await client.viewer
      const teams = await me.teams()

      return teams.nodes
    },
    enabled: !!client,
  })
}

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
    refetchInterval: 7 * 1000,
    retry: false,
  })
}

export function useLinearWorkflowStates() {
  const { data: client } = useLinearClient()

  return useQuery({
    queryKey: ['linear-workflow-states'],
    queryFn: async () => {
      if (!client) {
        throw new Error('No Linear client available')
      }

      const workflowStates = await client.workflowStates()

      return workflowStates.nodes.sort((a, b) => a.position - b.position)
    },
    enabled: !!client,
  })
}

export function useLinearAssignees() {
  const { data: client } = useLinearClient()

  return useQuery({
    queryKey: ['linear-assignees'],
    queryFn: async () => {
      if (!client) {
        throw new Error('No Linear client available')
      }

      const assignees = await client.users()

      return assignees.nodes.sort((a, b) => a.displayName.localeCompare(b.displayName))
    },
    enabled: !!client,
  })
}

export function useCreateLinearTicket(onSubmitSuccess: ((url: string) => void) | undefined) {
  const { data: client } = useLinearClient()
  const { data: teams } = useLinearTeams()

  return useMutation({
    mutationKey: ['create-linear-ticket'],
    mutationFn: async (data: LinearTicketFormSchema) => {
      const team = teams?.[0]

      if (!team?.id) {
        throw new Error('No team found')
      }

      let payload = {
        teamId: team.id,
        title: data.title,
        description: data.description,
      }

      if (data.assignee) {
        payload = Object.assign(payload, {
          assigneeId: data.assignee,
        })
      }

      if (data.status) {
        payload = Object.assign(payload, {
          stateId: data.status,
        })
      }

      const issuePayload = await client?.createIssue(payload)

      const issueUrl = (await issuePayload?.issue)?.url

      if (!issueUrl) {
        throw new Error('Something went wrong, no issue URL returned')
      }

      return issueUrl
    },
    onSuccess: (issueUrl) => {
      if (onSubmitSuccess) onSubmitSuccess(issueUrl)
    },
    onError: (error) => {
      console.warn(error.message)
    },
  })
}
