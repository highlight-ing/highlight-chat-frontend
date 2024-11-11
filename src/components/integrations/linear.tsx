import {
  checkLinearConnectionStatus,
  createMagicLinkForLinear,
  getLinearTokenForUser,
} from '@/utils/linear-server-actions'
import { useEffect, useRef, useState } from 'react'
import InputField from '@/components/TextInput/InputField'
import TextArea from '@/components/TextInput/TextArea'
import { LinearClient, Team } from '@linear/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Button from '@/components/Button/Button'
import { z } from 'zod'
import { LinearIcon } from '@/icons/icons'
import { SetupConnectionComponent } from './integration-auth'
import { IntegrationsLoader } from './loader'

const linearTicketFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
})

type LinearTicketFormData = z.infer<typeof linearTicketFormSchema>

export function LinearTicketFormComponent({
  title,
  description,
  onSubmitSuccess,
}: {
  title: string
  description: string
  onSubmitSuccess: (issueUrl: string) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LinearTicketFormData>({
    resolver: zodResolver(linearTicketFormSchema),
    defaultValues: {
      title,
      description: description + '\n\nCreated with [Highlight](https://highlightai.com)',
    },
  })

  const client = useRef<LinearClient>()
  const [linearApiToken, setLinearApiToken] = useState<string>()
  const [linearTeams, setLinearTeams] = useState<Team[]>()

  async function onSubmit(data: LinearTicketFormData) {
    const teams = await client.current?.teams()
    const team = teams?.nodes[0]
    if (team?.id) {
      const issuePayload = await client.current?.createIssue({
        teamId: team.id,
        title: data.title,
        description: data.description,
      })

      const issueUrl = (await issuePayload?.issue)?.url
      if (issueUrl) {
        onSubmitSuccess(issueUrl)
      } else {
        console.warn('Something went wrong, no issue URL returned')
      }
    }
  }

  useEffect(() => {
    if (!linearApiToken) {
      return
    }

    client.current = new LinearClient({
      accessToken: linearApiToken,
    })

    async function getLinearTeams() {
      if (!client.current) {
        return
      }

      const me = await client.current.viewer

      const teams = await me.teams()
      console.log('teams', teams.nodes)
      setLinearTeams(teams.nodes)
    }

    async function getLinearWorkflows() {
      if (!client.current) {
        return
      }

      const workflows = await client.current.workflowStates()
      console.log('workflows', workflows.nodes)
    }

    async function getLinearAssignees() {
      if (!client.current) {
        return
      }

      const assignees = await client.current.users()
      console.log('assignees', assignees.nodes)
    }

    getLinearTeams()
    getLinearWorkflows()
    getLinearAssignees()
  }, [linearApiToken])

  useEffect(() => {
    async function getLinearToken() {
      // @ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const token = await getLinearTokenForUser(hlToken)

      if (!token) {
        console.warn('Something is wrong, no Linear token found for user but we are in the Linear form')
        return
      }

      setLinearApiToken(token)
    }

    getLinearToken()
  }, [])

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <InputField size={'xxlarge'} label={'Title'} placeholder={'Issue Title'} {...register('title')} />
      <TextArea
        rows={4}
        size={'xxlarge'}
        label={'Description'}
        placeholder={'Issue Description'}
        {...register('description')}
      />
      <Button size={'medium'} variant={'primary'} type={'submit'} disabled={isSubmitting}>
        Create Issue
      </Button>
    </form>
  )
}

export function LinearTicketSuccessComponent({ issueUrl }: { issueUrl: string }) {
  return (
    <>
      Linear issue created:{' '}
      <a href={issueUrl} target="_blank">
        View Issue
      </a>
    </>
  )
}

export function CreateLinearTicketComponent({ title, description }: { title: string; description: string }) {
  const [state, setState] = useState<'loading' | 'connect' | 'form' | 'success'>('loading')
  const [issueUrl, setIssueUrl] = useState<string>()

  function onSubmitSuccess(issueUrl: string) {
    setIssueUrl(issueUrl)
    setState('success')
  }

  useEffect(() => {
    async function checkConnection() {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkLinearConnectionStatus(hlToken)
      if (connected) {
        setState('form')
      } else {
        setState('connect')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="mt-2">
      {state === 'loading' && <IntegrationsLoader />}
      {state === 'connect' && (
        <SetupConnectionComponent
          name={'Linear'}
          checkConnectionStatus={checkLinearConnectionStatus}
          onConnect={() => setState('form')}
          icon={<LinearIcon size={16} />}
          createMagicLink={createMagicLinkForLinear}
        />
      )}
      {state === 'form' && (
        <LinearTicketFormComponent title={title} description={description} onSubmitSuccess={onSubmitSuccess} />
      )}
      {state === 'success' && issueUrl && <LinearTicketSuccessComponent issueUrl={issueUrl} />}
    </div>
  )
}
