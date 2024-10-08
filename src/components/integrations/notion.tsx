import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InputField from '../TextInput/InputField'
import TextArea from '../TextInput/TextArea'
import Button from '../Button/Button'
import { useEffect, useState } from 'react'
import { NotionIcon } from '@/icons/icons'
import { SetupConnectionComponent } from './integration-auth'
import {
  checkNotionConnectionStatus,
  createMagicLinkForNotion,
  getNotionTokenForUser,
  getNotionParentItems,
} from '@/utils/notion-server-actions'
import { markdownToBlocks } from '@tryfabric/martian'
import { Client } from '@notionhq/client'
import { Text } from 'react-notion-x'

interface CreateNotionPageComponentProps {
  title: string
  description?: string
  content: string
}

const notionPageFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  content: z.string(),
})

type NotionPageFormData = z.infer<typeof notionPageFormSchema>

function FormComponent({ title, description, content }: CreateNotionPageComponentProps) {
  const [notionToken, setNotionToken] = useState<string | null>(null)

  useEffect(() => {
    async function getLinearToken() {
      // @ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const token = await getNotionTokenForUser(hlToken)

      if (!token) {
        console.warn('Something is wrong, no Notion token found for user but we are in the Notion form')
        return
      }

      setNotionToken(token)
    }

    getLinearToken()
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NotionPageFormData>({
    resolver: zodResolver(notionPageFormSchema),
    defaultValues: {
      title,
      description,
      content,
    },
  })

  async function onSubmit(data: NotionPageFormData) {
    if (!notionToken) {
      // TODO (Julian): Add more advanced error message here
      console.warn('Token not set, please try again later.')
      return
    }

    const users = await getNotionParentItems(notionToken)
    console.log(users)

    const blocks = markdownToBlocks(data.content, {
      notionLimits: {
        onError: (err) => {
          console.error('Error converting markdown to blocks', err)
        },
      },
    })

    console.log(blocks)
  }

  return (
    <div className="mt-2">
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <InputField size={'xxlarge'} label={'Title'} placeholder={'Issue Title'} {...register('title')} />
        <InputField
          size={'xxlarge'}
          label={'Description'}
          placeholder={'Issue Description'}
          {...register('description')}
        />
        <TextArea
          rows={5}
          size={'xxlarge'}
          label={'Markdown Content'}
          placeholder={'Page Content'}
          {...register('content')}
        />
        <Button size={'medium'} variant={'primary'} type={'submit'}>
          Create Page
        </Button>
      </form>
    </div>
  )
}

export function CreateNotionPageComponent({ title, description, content }: CreateNotionPageComponentProps) {
  const [state, setState] = useState<'loading' | 'connect' | 'form' | 'success'>('loading')

  useEffect(() => {
    // On mount, check to see if the user has setup Linear integration
    async function checkStatus() {
      // @ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkNotionConnectionStatus(hlToken)

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

  return (
    <div>
      {state === 'connect' && (
        <SetupConnectionComponent
          name={'Notion'}
          checkConnectionStatus={checkNotionConnectionStatus}
          onConnect={onConnect}
          icon={<NotionIcon size={16} />}
          createMagicLink={createMagicLinkForNotion}
        />
      )}
      {state === 'form' && <FormComponent title={title} description={description} content={content} />}
    </div>
  )
}
