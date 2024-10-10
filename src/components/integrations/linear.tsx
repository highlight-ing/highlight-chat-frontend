import {
  checkLinearConnectionStatus,
  createMagicLinkForLinear,
  getLinearTokenForUser,
} from '@/utils/linear-server-actions'
import { useEffect, useRef, useState } from 'react'
import InputField from '../TextInput/InputField'
import TextArea from '../TextInput/TextArea'
import { LinearClient, Team } from '@linear/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { LinearIcon } from '@/icons/icons'
import Button from '../Button/Button'
import { z } from 'zod'
import { SetupConnectionComponent } from './integration-auth'

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
    formState: { errors },
  } = useForm<LinearTicketFormData>({
    resolver: zodResolver(linearTicketFormSchema),
    defaultValues: {
      title,
      description,
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

    getLinearTeams()
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
      <InputField size={'medium'} label={'Title'} placeholder={'Issue Title'} {...register('title')} />
      <TextArea size={'medium'} label={'Description'} placeholder={'Issue Description'} {...register('description')} />
      <Button size={'medium'} variant={'primary'} type={'submit'}>
        Create Ticket
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

  useEffect(() => {
    // On mount, check to see if the user has setup Linear integration
    async function checkStatus() {
      // @ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkLinearConnectionStatus(hlToken)

      if (connected) {
        setState('form')
      } else {
        setState('connect')
      }
    }

    checkStatus()
  }, [])

  function onConnect() {
    setState('form')
  }

  function onSubmitSuccess(issueUrl: string) {
    setIssueUrl(issueUrl)
    setState('success')
  }

  return (
    <div className="mt-2">
      {state === 'connect' && (
        <SetupConnectionComponent
          name={'Linear'}
          checkConnectionStatus={checkLinearConnectionStatus}
          onConnect={onConnect}
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
