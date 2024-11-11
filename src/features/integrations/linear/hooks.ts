import { LinearClient } from '@linear/sdk'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getLinearTokenForUser } from './actions'
import { LinearTicketFormData } from './linear'

const TWO_MINUTES_IN_MILLI = 120000

export function useLinearApiToken() {
  return useQuery({
    queryKey: ['linearApiToken'],
    queryFn: async () => {
      // @ts-expect-error: highlight is mounted on window
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string
      const token = await getLinearTokenForUser(hlToken as string)

      if (!token) {
        console.warn('Something is wrong, no Linear token found for user but we are in the Linear form')
        throw new Error('No Linear token found')
      }

      return token
    },
    staleTime: TWO_MINUTES_IN_MILLI,
  })
}

export function useLinearClient() {
  const { data: linearApiToken } = useLinearApiToken()

  return useQuery({
    queryKey: ['linearClient', linearApiToken],
    queryFn: () => new LinearClient({ accessToken: linearApiToken }),
    enabled: !!linearApiToken,
    staleTime: Infinity,
  })
}

export function useLinearTeams() {
  const { data: client } = useLinearClient()

  return useQuery({
    queryKey: ['linearTeams'],
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

export function useLinearWorkflowStates() {
  const { data: client } = useLinearClient()

  return useQuery({
    queryKey: ['linearWorkflowStates'],
    queryFn: async () => {
      if (!client) {
        throw new Error('No Linear client available')
      }

      const workflowStates = await client.workflowStates()

      return workflowStates.nodes
    },
    enabled: !!client,
  })
}

export function useLinearAssignees() {
  const { data: client } = useLinearClient()

  return useQuery({
    queryKey: ['linearAssignees'],
    queryFn: async () => {
      if (!client) {
        throw new Error('No Linear client available')
      }

      const assignees = await client.users()

      return assignees.nodes.filter((assignee) => assignee.active)
    },
    enabled: !!client,
  })
}

export function useCreateLinearTicket(onSubmitSuccess: ((url: string) => void) | undefined) {
  const { data: client } = useLinearClient()
  const { data: teams } = useLinearTeams()

  return useMutation({
    mutationKey: ['create-linear-ticket'],
    mutationFn: async (data: LinearTicketFormData) => {
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
