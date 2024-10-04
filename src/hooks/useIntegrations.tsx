import {
  checkLinearConnectionStatus,
  createMagicLinkForLinear,
  getLinearTokenForUser,
} from '@/utils/linear-server-actions'
import { useStore } from '@/providers/store-provider'
import { useEffect, useRef, useState } from 'react'
import Button from '@/components/Button/Button'
import InputField from '@/components/TextInput/InputField'
import TextArea from '@/components/TextInput/TextArea'
import { LinearClient, Team } from '@linear/sdk'
import { LinearIcon } from '@/icons/icons'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export interface UseIntegrationsAPI {
  createLinearTicket: (conversationId: string, title: string, description: string) => Promise<void>
}

function MessageWithComponent({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <div>
      <p>{content}</p>
      {children}
    </div>
  )
}

function LinearConnectionComponent({ onConnect }: { onConnect: () => void }) {
  const [connectLink, setConnectLink] = useState<string>('')
  const [connectClicked, setConnectClicked] = useState(false)

  async function checkConnectionStatus() {
    // @ts-ignore
    const hlToken = (await highlight.internal.getAuthorizationToken()) as string

    const connected = await checkLinearConnectionStatus(hlToken)

    if (connected) {
      onConnect()
    }
  }

  useEffect(() => {
    if (connectClicked) {
      // Create an interval that checks the connection status every 5 seconds
      const interval = setInterval(() => {
        checkConnectionStatus()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [connectClicked])

  useEffect(() => {
    async function getConnectLink() {
      // Fetch the latest Highlight authorization token (only available to Highlight Chat)
      try {
        // @ts-ignore
        const token = (await highlight.internal.getAuthorizationToken()) as string

        const connectLink = await createMagicLinkForLinear(token)
        setConnectLink(connectLink)
      } catch (e) {
        console.warn('Error getting authorization token', e)
        return
      }
    }

    getConnectLink()
  }, [])

  return (
    <div className="mt-2 flex flex-col gap-2">
      <p>You'll need to connect your Linear account first.</p>
      <Button
        disabled={!connectLink}
        size="small"
        variant="primary-outline"
        onClick={() => {
          setConnectClicked(true)
          window.open(connectLink, '_blank')
        }}
      >
        <LinearIcon size={16} /> Connect Linear
      </Button>

      <small onClick={checkConnectionStatus} className="cursor-pointer underline">
        Check connection status
      </small>
    </div>
  )
}

const linearTicketFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
})

type LinearTicketFormData = z.infer<typeof linearTicketFormSchema>

function LinearTicketFormComponent({
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
    <div className="mt-2">
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <InputField size={'medium'} label={'Title'} placeholder={'Issue Title'} {...register('title')} />
        <TextArea
          size={'medium'}
          label={'Description'}
          placeholder={'Issue Description'}
          {...register('description')}
        />
        <Button size={'medium'} variant={'primary'} type={'submit'}>
          Create Ticket
        </Button>
      </form>
    </div>
  )
}

function LinearTicketSuccessComponent({ issueUrl }: { issueUrl: string }) {
  return (
    <div className="mt-2">
      Linear issue created:{' '}
      <a href={issueUrl} target="_blank">
        View Issue
      </a>
    </div>
  )
}

function CreateLinearTicketComponent({ title, description }: { title: string; description: string }) {
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
    <div>
      {state === 'connect' && <LinearConnectionComponent onConnect={onConnect} />}
      {state === 'form' && (
        <LinearTicketFormComponent title={title} description={description} onSubmitSuccess={onSubmitSuccess} />
      )}
      {state === 'success' && issueUrl && <LinearTicketSuccessComponent issueUrl={issueUrl} />}
    </div>
  )
}

export function useIntegrations(): UseIntegrationsAPI {
  const getLastConversationMessage = useStore((state) => state.getLastConversationMessage)
  const updateLastConversationMessage = useStore((state) => state.updateLastConversationMessage)

  async function createLinearTicket(conversationId: string, title: string, description: string) {
    const lastMessage = getLastConversationMessage(conversationId)

    // Update the last message to show the Linear ticket component which will handle checking for authentication,
    // creating the ticket, and showing the success message.
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={lastMessage?.content as string}>
          <CreateLinearTicketComponent title={title} description={description} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  return { createLinearTicket }
}
